<template>
  <div class="page-content">
    <div class="d-flex flex-wrap align-end justify-space-between mb-7">
      <div>
        <div class="eyebrow mb-2">Your workspace</div>
        <h1 class="page-heading mb-2">My tasks</h1>
        <p class="muted-copy mb-0">Keep the important things moving.</p>
      </div>
      <v-btn
        to="/create-task"
        color="primary"
        depressed
        class="text-none mt-4 mt-sm-0"
      >
        <v-icon left small>mdi-plus</v-icon>
        Add a task
      </v-btn>
    </div>

    <v-card flat class="surface-card pa-4 pa-sm-5 mb-5">
      <v-row align="center">
        <v-col cols="12" sm="6" md="5">
          <v-text-field
            v-model="search"
            aria-label="Search tasks"
            hide-details
            outlined
            dense
            clearable
            prepend-inner-icon="mdi-magnify"
            placeholder="Search tasks, categories..."
          />
        </v-col>
        <v-col cols="12" sm="6" md="7" class="d-flex flex-wrap justify-sm-end">
          <v-chip
            v-for="filter in filters"
            :key="filter.value"
            :input-value="activeFilter === filter.value"
            :color="activeFilter === filter.value ? 'primary' : undefined"
            :text-color="
              activeFilter === filter.value ? 'white' : 'grey darken-1'
            "
            class="mr-2 mb-1"
            small
            label
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span class="ml-1">({{ filterCount(filter.value) }})</span>
          </v-chip>
        </v-col>
      </v-row>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-body-2 font-weight-bold">
        {{ filteredTasks.length }} tasks
      </div>
      <v-select
        v-model="sortOrder"
        :items="sortOptions"
        hide-details
        dense
        outlined
        style="max-width: 175px;"
        aria-label="Sort tasks"
      />
    </div>

    <v-row v-if="filteredTasks.length">
      <v-col v-for="task in filteredTasks" :key="task.id" cols="12" md="6">
        <v-card flat class="surface-card pa-5 task-card">
          <div class="d-flex align-start">
            <v-btn
              icon
              small
              :aria-label="
                task.status === 'completed'
                  ? 'Reopen task'
                  : 'Mark task complete'
              "
              @click="toggleTask(task)"
            >
              <v-icon
                :color="
                  task.status === 'completed' ? 'success' : 'grey lighten-1'
                "
              >
                {{
                  task.status === "completed"
                    ? "mdi-check-circle"
                    : "mdi-circle-outline"
                }}
              </v-icon>
            </v-btn>
            <div class="flex-grow-1 ml-2">
              <div class="d-flex flex-wrap align-center justify-space-between">
                <nuxt-link
                  :to="`/tasks/${task.id}`"
                  class="task-title text-decoration-none"
                >
                  {{ task.title }}
                </nuxt-link>
                <div
                  class="status-pill mt-1 mt-sm-0"
                  :class="`status-${task.status}`"
                >
                  {{ statusLabel(task.status) }}
                </div>
              </div>
              <div
                class="d-flex flex-wrap align-center text-caption muted-copy mt-2"
              >
                <span
                  class="priority-dot"
                  :class="priorityClass(task.priority)"
                />
                {{ task.priority }} priority <span class="mx-2">|</span
                >{{ task.category }}
              </div>
              <p
                class="text-body-2 mt-4 mb-4"
                style="color: #777b91; line-height: 1.65;"
              >
                {{ task.description }}
              </p>
              <div class="d-flex flex-wrap align-center justify-space-between">
                <div class="d-flex align-center text-caption muted-copy">
                  <v-icon left x-small color="grey"
                    >mdi-calendar-outline</v-icon
                  >
                  Due {{ formatDate(task.dueDate) }}
                </div>
                <div class="d-flex align-center text-caption muted-copy">
                  <v-icon left x-small color="grey">mdi-clock-outline</v-icon>
                  {{ trackedTime(task.trackedSeconds) }} tracked
                </div>
                <v-btn
                  :to="`/tasks/${task.id}`"
                  text
                  small
                  color="primary"
                  class="text-none"
                >
                  Details <v-icon right small>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else flat class="surface-card text-center pa-8 pa-sm-12">
      <v-avatar color="deep-purple lighten-5" size="62">
        <v-icon color="primary" size="28">mdi-text-search</v-icon>
      </v-avatar>
      <h2 class="text-h6 font-weight-bold mt-4 mb-2">
        {{
          search || activeFilter !== "all"
            ? "No tasks match that view"
            : "Your task list is clear"
        }}
      </h2>
      <p class="muted-copy mb-5">
        {{
          search || activeFilter !== "all"
            ? "Try a different search or filter."
            : "Create a task to give your next idea a home."
        }}
      </p>
      <v-btn
        v-if="!search && activeFilter === 'all'"
        to="/create-task"
        color="primary"
        depressed
        class="text-none"
      >
        Create your first task
      </v-btn>
      <v-btn
        v-else
        text
        color="primary"
        class="text-none"
        @click="resetFilters"
      >
        Clear filters
      </v-btn>
    </v-card>
  </div>
</template>

<script>
export default {
  middleware: "authenticated",
  data() {
    return {
      search: "",
      activeFilter: "all",
      sortOrder: "Due date",
      sortOptions: ["Due date", "Priority", "Recently added"],
      filters: [
        { label: "All", value: "all" },
        { label: "In progress", value: "in-progress" },
        { label: "To do", value: "todo" },
        { label: "Completed", value: "completed" },
      ],
    };
  },
  computed: {
    tasks() {
      return this.$store.state.allTasks;
    },
    filteredTasks() {
      const query = this.search.trim().toLowerCase();
      const tasks = this.tasks.filter((task) => {
        const matchesFilter =
          this.activeFilter === "all" || task.status === this.activeFilter;
        const matchesSearch =
          !query ||
          [task.title, task.category, task.description, task.clientName]
            .join(" ")
            .toLowerCase()
            .includes(query);
        return matchesFilter && matchesSearch;
      });

      return tasks.sort((a, b) => {
        const completionOrder =
          Number(a.status === "completed") - Number(b.status === "completed");
        if (completionOrder) {
          return completionOrder;
        }
        if (this.sortOrder === "Priority") {
          const rank = { High: 0, Medium: 1, Low: 2 };
          return rank[a.priority] - rank[b.priority];
        }
        if (this.sortOrder === "Recently added") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    },
  },
  methods: {
    filterCount(filter) {
      return filter === "all"
        ? this.tasks.length
        : this.tasks.filter((task) => task.status === filter).length;
    },
    statusLabel(status) {
      return (
        {
          todo: "To do",
          "in-progress": "In progress",
          review: "In review",
          completed: "Completed",
        }[status] || status
      );
    },
    priorityClass(priority) {
      return `priority-${priority.toLowerCase()}`;
    },
    formatDate(value) {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value));
    },
    trackedTime(seconds) {
      return `${((Number(seconds) || 0) / 3600).toFixed(1)}h`;
    },
    async toggleTask(task) {
      try {
        await this.$store.dispatch("updateTask", {
          id: task.id,
          changes: {
            status: task.status === "completed" ? "in-progress" : "completed",
          },
        });
      } catch (error) {
        this.$store.commit(
          "setTaskError",
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            "Task status could not be updated."
        );
      }
    },
    resetFilters() {
      this.search = "";
      this.activeFilter = "all";
    },
  },
};
</script>

<style scoped>
.task-card {
  height: 100%;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.task-card:hover {
  box-shadow: 0 14px 32px rgba(32, 35, 58, 0.08) !important;
  transform: translateY(-2px);
}
</style>
