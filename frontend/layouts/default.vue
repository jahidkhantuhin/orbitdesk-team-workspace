<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="app-drawer"
      :permanent="$vuetify.breakpoint.mdAndUp"
      :temporary="$vuetify.breakpoint.smAndDown"
      width="252"
    >
      <div class="d-flex align-center px-6 pt-6 pb-8">
        <span class="brand-mark mr-3">
          <v-icon color="white" size="21">mdi-check-decagram</v-icon>
        </span>
        <span class="brand-wordmark">{{ $config.appName }}</span>
      </div>

      <div class="eyebrow px-6 mb-2">Workspace</div>
      <v-btn
        v-for="item in primaryLinks"
        :key="item.to"
        :to="item.to"
        exact
        block
        text
        class="nav-link justify-start"
        @click="closeDrawer"
      >
        <v-icon size="20">{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>

      <v-divider class="my-5 mx-5" />
      <div class="eyebrow px-6 mb-2">Your space</div>
      <v-btn
        v-if="isAuthenticated"
        to="/create-task"
        exact
        block
        text
        class="nav-link justify-start"
        @click="closeDrawer"
      >
        <v-icon size="20">mdi-plus-circle-outline</v-icon>
        Create a task
      </v-btn>
      <v-btn
        v-if="!isAuthenticated"
        to="/signin"
        block
        text
        class="nav-link justify-start"
        @click="closeDrawer"
      >
        <v-icon size="20">mdi-login-variant</v-icon>
        Sign in
      </v-btn>

      <v-spacer />
      <div class="px-5 pb-5">
        <div class="surface-card pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="deep-purple lighten-5" size="34">
              <span
                class="deep-purple--text text--darken-2 text-caption font-weight-bold"
              >
                {{ userInitials }}
              </span>
            </v-avatar>
            <div class="ml-3 overflow-hidden">
              <div class="text-body-2 font-weight-bold text-truncate">
                {{ displayName }}
              </div>
              <div class="text-caption muted-copy">
                {{ isDemo ? "Demo workspace" : "Personal workspace" }}
              </div>
            </div>
          </div>
          <v-btn
            v-if="isAuthenticated"
            block
            text
            small
            class="justify-start px-0"
            color="grey darken-1"
            @click="onLogout"
          >
            <v-icon left small>mdi-logout-variant</v-icon>
            Sign out
          </v-btn>
          <div v-else class="text-caption muted-copy">
            A calmer way to get things done.
          </div>
        </div>
        <div class="text-caption text-center muted-copy mt-4">
          Crafted by {{ $config.ownerName }}
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar app flat height="74" class="app-bar px-sm-4">
      <v-app-bar-nav-icon
        class="d-flex d-md-none mr-2"
        aria-label="Open navigation"
        @click.stop="drawer = !drawer"
      />
      <div class="d-none d-md-block">
        <div class="text-subtitle-1 font-weight-bold">{{ pageTitle }}</div>
        <div class="text-caption muted-copy">{{ pageSubtitle }}</div>
      </div>
      <v-spacer />
      <v-btn
        v-if="isAuthenticated"
        to="/create-task"
        color="primary"
        depressed
        class="text-none"
        :small="$vuetify.breakpoint.xsOnly"
      >
        <v-icon left small>mdi-plus</v-icon>
        <span class="d-none d-sm-inline">New task</span>
        <span class="d-sm-none">New</span>
      </v-btn>
      <v-btn
        v-else
        to="/signup"
        color="primary"
        depressed
        class="text-none"
        small
      >
        Get started
      </v-btn>
      <v-avatar
        v-if="isAuthenticated"
        class="ml-3 d-none d-sm-flex"
        color="deep-purple lighten-5"
        size="38"
      >
        <span
          class="deep-purple--text text--darken-2 text-caption font-weight-bold"
        >
          {{ userInitials }}
        </span>
      </v-avatar>
    </v-app-bar>

    <v-main>
      <v-alert
        v-if="taskError"
        type="error"
        dense
        text
        dismissible
        class="mx-4 mt-4"
        @input="$store.commit('setTaskError', '')"
      >
        {{ taskError }}
        <v-btn
          text
          small
          color="error"
          class="ml-2 text-none"
          :loading="loadingTasks"
          @click="reloadTasks"
        >
          Retry
        </v-btn>
      </v-alert>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    isDemo() {
      return this.$store.state.isDemo;
    },
    taskError() {
      return this.$store.state.taskError;
    },
    loadingTasks() {
      return this.$store.state.loadingTasks;
    },
    displayName() {
      return this.$store.state.userName || this.$config.ownerName;
    },
    userInitials() {
      return this.displayName
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
    },
    primaryLinks() {
      return [
        { title: "Overview", to: "/", icon: "mdi-view-dashboard-outline" },
        {
          title: "My tasks",
          to: "/tasks",
          icon: "mdi-checkbox-marked-circle-outline",
        },
      ];
    },
    pageTitle() {
      const titles = {
        index: "Overview",
        "tasks-index": "My tasks",
        "tasks-id": "Task details",
        "create-task": "Create a task",
        "signin-index": "Welcome back",
        "signup-index": "Create your account",
      };
      return titles[this.$route.name] || this.$config.appName;
    },
    pageSubtitle() {
      return this.isAuthenticated
        ? "Make space for your best work."
        : "A thoughtful workspace for your next big thing.";
    },
  },
  mounted() {
    this.$store.dispatch("initialize");
  },
  methods: {
    closeDrawer() {
      if (this.$vuetify.breakpoint.smAndDown) {
        this.drawer = false;
      }
    },
    onLogout() {
      this.$store.dispatch("logOut");
    },
    reloadTasks() {
      this.$store.dispatch("loadTasks").catch((error) => {
        this.$store.commit(
          "setTaskError",
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            "Tasks could not be loaded. Please try again."
        );
      });
    },
  },
};
</script>
