const STORAGE_KEYS = {
  token: "orbitdesk.token",
  userId: "orbitdesk.userId",
  userName: "orbitdesk.userName",
  expiresAt: "orbitdesk.expiresAt",
  isDemo: "orbitdesk.isDemo",
};

let sessionTimer;

function sessionExpiry() {
  return Date.now() + 60 * 60 * 1000;
}

function clearStoredSession() {
  if (!process.client) {
    return;
  }
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

function errorMessage(error, fallback) {
  return (
    (error.response && error.response.data && error.response.data.message) ||
    fallback
  );
}

export const state = () => ({
  allTasks: [],
  idToken: null,
  userId: null,
  userName: null,
  isDemo: false,
  initialized: false,
  loadingTasks: false,
  taskError: "",
});

export const mutations = {
  setTasks(state, tasks) {
    state.allTasks = tasks;
  },
  createTask(state, task) {
    state.allTasks.unshift(task);
  },
  replaceTask(state, task) {
    const index = state.allTasks.findIndex((item) => item.id === task.id);
    if (index !== -1) {
      state.allTasks.splice(index, 1, task);
    }
  },
  deleteTask(state, id) {
    state.allTasks = state.allTasks.filter((task) => task.id !== id);
  },
  authUser(state, userData) {
    state.idToken = userData.idToken;
    state.userId = userData.userId;
    state.userName = userData.userName;
    state.isDemo = Boolean(userData.isDemo);
  },
  clearAuthData(state) {
    state.idToken = null;
    state.userId = null;
    state.userName = null;
    state.isDemo = false;
    state.allTasks = [];
    state.initialized = true;
    state.taskError = "";
    state.loadingTasks = false;
  },
  setInitialized(state, initialized) {
    state.initialized = initialized;
  },
  setLoadingTasks(state, loading) {
    state.loadingTasks = loading;
  },
  setTaskError(state, message) {
    state.taskError = message;
  },
};

export const actions = {
  async initialize({ commit, dispatch, state }) {
    if (!process.client || state.initialized) {
      return;
    }

    commit("setInitialized", true);
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.expiresAt));
    if (!token || !expiresAt || Date.now() >= expiresAt) {
      clearStoredSession();
      commit("clearAuthData");
      return;
    }

    this.$axios.setToken(token, "Bearer");
    commit("authUser", {
      idToken: token,
      userId: localStorage.getItem(STORAGE_KEYS.userId),
      userName: localStorage.getItem(STORAGE_KEYS.userName),
      isDemo: localStorage.getItem(STORAGE_KEYS.isDemo) === "true",
    });

    try {
      await dispatch("loadTasks");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        clearStoredSession();
        this.$axios.setToken(false);
        commit("clearAuthData");
      }
    }

    const remaining = expiresAt - Date.now();
    if (remaining > 0) {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      sessionTimer = setTimeout(() => dispatch("logOut"), remaining);
    }
  },

  async loadTasks({ commit }) {
    commit("setLoadingTasks", true);
    commit("setTaskError", "");
    try {
      const response = await this.$axios.$get("/tasks");
      commit("setTasks", response.tasks);
      return response.tasks;
    } catch (error) {
      commit(
        "setTaskError",
        errorMessage(error, "Tasks could not be loaded. Please try again.")
      );
      throw error;
    } finally {
      commit("setLoadingTasks", false);
    }
  },

  async signUserUp({ dispatch }, payload) {
    await this.$axios.$put("/signup", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
    await dispatch("signUserIn", {
      email: payload.email,
      password: payload.password,
    });
  },

  async requestPasswordReset(context, email) {
    return this.$axios.$post("/reset", { email });
  },

  async updatePassword(context, payload) {
    return this.$axios.$post("/update-password", {
      token: payload.token,
      password: payload.password,
    });
  },

  async signUserIn({ commit, dispatch }, payload) {
    const credentials = { email: payload.email, password: payload.password };
    if (!credentials.email || !credentials.password) {
      throw new Error(
        "The demo account is not configured. Follow the local setup instructions."
      );
    }

    const user = await this.$axios.$post("/login", credentials);
    const expiresAt = sessionExpiry();
    const userName =
      user.name || credentials.email.split("@")[0].replace(/[._-]/g, " ");

    localStorage.setItem(STORAGE_KEYS.token, user.token);
    localStorage.setItem(STORAGE_KEYS.userId, user.userId);
    localStorage.setItem(STORAGE_KEYS.userName, userName);
    localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
    localStorage.setItem(STORAGE_KEYS.isDemo, String(Boolean(payload.demo)));
    this.$axios.setToken(user.token, "Bearer");
    commit("authUser", {
      idToken: user.token,
      userId: user.userId,
      userName,
      isDemo: Boolean(payload.demo),
    });
    commit("setInitialized", true);

    try {
      await dispatch("loadTasks");
    } catch (error) {
      clearStoredSession();
      this.$axios.setToken(false);
      commit("clearAuthData");
      throw error;
    }

    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    sessionTimer = setTimeout(() => dispatch("logOut"), expiresAt - Date.now());
  },

  logOut({ commit }) {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      sessionTimer = null;
    }
    clearStoredSession();
    this.$axios.setToken(false);
    commit("clearAuthData");
    this.$router.push("/signin");
  },

  async createTask({ commit }, payload) {
    const response = await this.$axios.$post("/tasks", payload);
    commit("createTask", response.task);
    return response.task;
  },

  async updateTask({ commit }, { id, changes }) {
    try {
      const response = await this.$axios.$patch(
        `/tasks/${encodeURIComponent(id)}`,
        changes
      );
      commit("replaceTask", response.task);
      return response.task;
    } catch (error) {
      commit(
        "setTaskError",
        errorMessage(error, "Task changes could not be saved.")
      );
      throw error;
    }
  },

  async deleteTask({ commit }, id) {
    try {
      await this.$axios.$delete(`/tasks/${encodeURIComponent(id)}`);
      commit("deleteTask", id);
    } catch (error) {
      commit(
        "setTaskError",
        errorMessage(error, "The task could not be deleted.")
      );
      throw error;
    }
  },
};

export const getters = {
  singleTask: (state) => (taskId) =>
    state.allTasks.find((task) => task.id === taskId),
  isAuthenticated: (state) => state.userId !== null,
};
