<template>
  <div class="page-content">
    <div class="d-flex flex-wrap align-end justify-space-between mb-7">
      <div>
        <div class="eyebrow mb-2">{{ todayLabel }}</div>
        <h1 class="page-heading mb-2">
          Good to see you, {{ firstName }}
          <v-icon small color="accent">mdi-sparkles</v-icon>
        </h1>
        <p class="muted-copy mb-0">
          A little progress each day adds up to remarkable things.
        </p>
      </div>
      <v-btn
        v-if="!isAuthenticated"
        to="/signin"
        color="primary"
        depressed
        class="text-none mt-4 mt-sm-0"
      >
        <v-icon left small>mdi-play-circle-outline</v-icon>
        Explore the demo
      </v-btn>
      <v-btn
        v-else
        to="/create-task"
        color="primary"
        depressed
        class="text-none mt-4 mt-sm-0"
      >
        <v-icon left small>mdi-plus</v-icon>
        Create a task
      </v-btn>
    </div>

    <section class="hero-panel pa-6 pa-sm-8 mb-7">
      <div class="hero-orbit" aria-hidden="true" />
      <v-row align="center">
        <v-col cols="12" md="7" class="position-relative">
          <div class="text-overline font-weight-bold" style="color: #c9c4ff;">
            YOUR WORK, IN A GOOD PLACE
          </div>
          <h2
            class="white--text mt-2 mb-3"
            style="font-size: clamp(1.7rem, 3vw, 2.45rem); line-height: 1.18;"
          >
            Turn ambition into<br class="d-none d-sm-block" />
            momentum.
          </h2>
          <p class="mb-6" style="color: #d3d1e8; max-width: 430px;">
            Plan with intention, keep your priorities close, and make progress
            you can actually feel.
          </p>
          <v-btn
            :to="isAuthenticated ? '/tasks' : '/signin'"
            color="white"
            class="primary--text font-weight-bold text-none"
            depressed
          >
            {{ isAuthenticated ? "See your tasks" : "Step inside" }}
            <v-icon right small>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" md="5" class="position-relative pt-6 pt-md-0">
          <div class="d-flex align-center mb-4">
            <v-avatar color="rgba(255,255,255,.16)" size="42">
              <v-icon color="white">mdi-flash-outline</v-icon>
            </v-avatar>
            <div class="ml-3">
              <div class="font-weight-bold white--text">
                Your focus this week
              </div>
              <div class="text-caption" style="color: #c8c5e1;">
                One meaningful step at a time
              </div>
            </div>
          </div>
          <div
            class="d-flex justify-space-between text-caption mb-2"
            style="color: #dedcf2;"
          >
            <span>Tasks completed</span>
            <span>{{ completedTasks.length }} of {{ tasks.length }}</span>
          </div>
          <div
            style="
              background: rgba(255, 255, 255, 0.18);
              border-radius: 20px;
              height: 8px;
              overflow: hidden;
            "
          >
            <div
              :style="{
                width: completionRate + '%',
                height: '100%',
                background: '#8fe0c8',
                borderRadius: '20px',
              }"
            />
          </div>
          <div class="text-caption mt-3" style="color: #c8c5e1;">
            {{ openTasks.length }} thoughtful
            {{ openTasks.length === 1 ? "priority" : "priorities" }} still in
            motion
          </div>
        </v-col>
      </v-row>
    </section>

    <v-row class="mb-2">
      <v-col cols="6" md="3">
        <v-card flat class="surface-card stat-card">
          <div class="d-flex align-center justify-space-between mb-5">
            <span class="stat-label">Total tasks</span>
            <v-avatar color="deep-purple lighten-5" size="34"
              ><v-icon small color="primary"
                >mdi-format-list-checks</v-icon
              ></v-avatar
            >
          </div>
          <div class="stat-value">{{ tasks.length }}</div>
          <div class="text-caption muted-copy mt-2">Across your workspace</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card flat class="surface-card stat-card">
          <div class="d-flex align-center justify-space-between mb-5">
            <span class="stat-label">In progress</span>
            <v-avatar color="blue lighten-5" size="34"
              ><v-icon small color="blue darken-1"
                >mdi-progress-clock</v-icon
              ></v-avatar
            >
          </div>
          <div class="stat-value">{{ activeTasks.length }}</div>
          <div class="text-caption muted-copy mt-2">Good things underway</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card flat class="surface-card stat-card">
          <div class="d-flex align-center justify-space-between mb-5">
            <span class="stat-label">Completed</span>
            <v-avatar color="green lighten-5" size="34"
              ><v-icon small color="success"
                >mdi-check-circle-outline</v-icon
              ></v-avatar
            >
          </div>
          <div class="stat-value">{{ completedTasks.length }}</div>
          <div class="text-caption muted-copy mt-2">A reason to feel good</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card flat class="surface-card stat-card">
          <div class="d-flex align-center justify-space-between mb-5">
            <span class="stat-label">Focus hours</span>
            <v-avatar color="orange lighten-5" size="34"
              ><v-icon small color="accent">mdi-timer-outline</v-icon></v-avatar
            >
          </div>
          <div class="stat-value">{{ focusHours }}</div>
          <div class="text-caption muted-copy mt-2">Time you've invested</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" lg="7">
        <v-card flat class="surface-card pa-5 pa-sm-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <h2 class="text-h6 font-weight-bold mb-1">Coming up</h2>
              <div class="text-caption muted-copy">
                Your next few steps, all in one place.
              </div>
            </div>
            <v-btn to="/tasks" text small color="primary" class="text-none">
              View all <v-icon right small>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div v-if="upcomingTasks.length">
            <div v-for="task in upcomingTasks" :key="task.id" class="task-row">
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
              <nuxt-link
                :to="`/tasks/${task.id}`"
                class="flex-grow-1 text-decoration-none"
              >
                <div class="task-title">{{ task.title }}</div>
                <div class="text-caption muted-copy mt-1">
                  <span
                    class="priority-dot"
                    :class="priorityClass(task.priority)"
                  />
                  {{ task.priority }} priority <span class="mx-1">|</span
                  >{{ task.category }}
                </div>
              </nuxt-link>
              <div class="text-right task-row-meta">
                <div class="status-pill" :class="`status-${task.status}`">
                  {{ statusLabel(task.status) }}
                </div>
                <div class="text-caption muted-copy mt-2">
                  {{ formatDate(task.dueDate) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-9">
            <v-icon color="success" size="42"
              >mdi-check-decagram-outline</v-icon
            >
            <div class="font-weight-bold mt-3">Everything is wrapped up.</div>
            <div class="text-caption muted-copy mt-1">
              Enjoy the breathing room or start something new.
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card flat class="surface-card pa-5 pa-sm-6 mb-5">
          <div class="d-flex align-center justify-space-between mb-5">
            <div>
              <h2 class="text-h6 font-weight-bold mb-1">Focus list</h2>
              <div class="text-caption muted-copy">
                High-priority work, without the noise.
              </div>
            </div>
            <v-icon color="accent">mdi-target</v-icon>
          </div>
          <div v-if="priorityTasks.length">
            <nuxt-link
              v-for="task in priorityTasks"
              :key="task.id"
              :to="`/tasks/${task.id}`"
              class="d-flex align-center py-3 text-decoration-none"
              style="border-top: 1px solid #f0f1f6;"
            >
              <v-avatar color="deep-purple lighten-5" size="38">
                <v-icon small color="primary">{{
                  categoryIcon(task.category)
                }}</v-icon>
              </v-avatar>
              <div class="ml-3 flex-grow-1">
                <div class="task-title">{{ task.title }}</div>
                <div class="text-caption muted-copy mt-1">
                  {{ task.estimate }}h planned
                </div>
              </div>
              <v-icon small color="grey lighten-1">mdi-chevron-right</v-icon>
            </nuxt-link>
          </div>
          <div v-else class="text-body-2 muted-copy py-4">
            No urgent work in your queue. Keep that momentum going.
          </div>
        </v-card>

        <v-card flat class="surface-card pa-5 pa-sm-6">
          <div class="d-flex align-center mb-4">
            <v-avatar color="teal lighten-5" size="40">
              <v-icon color="secondary">mdi-lightbulb-on-outline</v-icon>
            </v-avatar>
            <div class="ml-3">
              <h2 class="text-subtitle-1 font-weight-bold mb-0">
                A gentle reminder
              </h2>
              <div class="text-caption muted-copy">
                A little space goes a long way.
              </div>
            </div>
          </div>
          <p class="text-body-2 mb-0" style="color: #6f7388; line-height: 1.7;">
            You don't have to do it all today. Choose what matters, give it your
            attention, and let the rest wait.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  computed: {
    tasks() {
      return this.$store.state.allTasks;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    firstName() {
      const name = this.$store.state.userName || this.$config.ownerName;
      return name.split(/\s+/)[0];
    },
    todayLabel() {
      return new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date());
    },
    openTasks() {
      return this.tasks.filter((task) => task.status !== "completed");
    },
    activeTasks() {
      return this.tasks.filter((task) =>
        ["in-progress", "review"].includes(task.status)
      );
    },
    completedTasks() {
      return this.tasks.filter((task) => task.status === "completed");
    },
    upcomingTasks() {
      return [...this.openTasks]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4);
    },
    priorityTasks() {
      return this.openTasks
        .filter((task) => task.priority === "High")
        .slice(0, 3);
    },
    completionRate() {
      return this.tasks.length
        ? Math.round((this.completedTasks.length / this.tasks.length) * 100)
        : 0;
    },
    focusHours() {
      const seconds = this.tasks.reduce(
        (total, task) => total + (Number(task.trackedSeconds) || 0),
        0
      );
      return (seconds / 3600).toFixed(1);
    },
  },
  methods: {
    formatDate(value) {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(new Date(value));
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
    categoryIcon(category) {
      return (
        {
          Product: "mdi-rocket-launch-outline",
          Design: "mdi-palette-outline",
          Engineering: "mdi-code-tags",
          Research: "mdi-magnify",
          Planning: "mdi-compass-outline",
        }[category] || "mdi-checkbox-marked-circle-outline"
      );
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
  },
};
</script>
