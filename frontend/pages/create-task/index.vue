<template>
  <div class="page-content">
    <div class="mb-7">
      <div class="eyebrow mb-2">Make it happen</div>
      <h1 class="page-heading mb-2">Create a task</h1>
      <p class="muted-copy mb-0">
        Give your next important step a clear place to begin.
      </p>
    </div>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card flat class="surface-card pa-5 pa-sm-7">
          <v-alert v-if="formError" type="error" dense text class="mb-5">
            {{ formError }}
          </v-alert>
          <form @submit.prevent="onCreateTask">
            <v-row>
              <v-col cols="12">
                <label class="form-label" for="task-title">Task name</label>
                <v-text-field
                  id="task-title"
                  v-model.trim="title"
                  required
                  outlined
                  dense
                  hide-details="auto"
                  placeholder="What needs to get done?"
                  maxlength="100"
                />
              </v-col>
              <v-col cols="12">
                <label class="form-label" for="task-description"
                  >A little context</label
                >
                <v-textarea
                  id="task-description"
                  v-model.trim="description"
                  required
                  outlined
                  rows="4"
                  auto-grow
                  hide-details="auto"
                  placeholder="Add the details that will help you make progress..."
                  maxlength="1000"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-category">Category</label>
                <v-select
                  id="task-category"
                  v-model="category"
                  :items="categories"
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-priority">Priority</label>
                <v-select
                  id="task-priority"
                  v-model="priority"
                  :items="priorities"
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-due-date">Due date</label>
                <v-text-field
                  id="task-due-date"
                  v-model="dueDate"
                  type="date"
                  :min="minimumDate"
                  required
                  outlined
                  dense
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-due-time"
                  >A time that works</label
                >
                <v-text-field
                  id="task-due-time"
                  v-model="dueTime"
                  type="time"
                  required
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-estimate"
                  >Estimated effort</label
                >
                <v-select
                  id="task-estimate"
                  v-model="estimate"
                  :items="estimates"
                  item-text="label"
                  item-value="value"
                  outlined
                  dense
                  hide-details
                  suffix="hours"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="form-label" for="task-location">Workspace</label>
                <v-text-field
                  id="task-location"
                  v-model.trim="location"
                  outlined
                  dense
                  hide-details
                  placeholder="Remote"
                  maxlength="60"
                />
              </v-col>
            </v-row>
            <v-divider class="my-4" />
            <div class="d-flex flex-wrap justify-space-between align-center">
              <v-btn to="/tasks" text class="text-none">
                <v-icon left small>mdi-arrow-left</v-icon>
                Cancel
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                depressed
                class="text-none px-6 mt-3 mt-sm-0"
                :disabled="!formIsValid"
                :loading="busy"
              >
                Create task
                <v-icon right small>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </form>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card flat class="surface-card pa-5 pa-sm-6">
          <div class="eyebrow mb-4">A small preview</div>
          <v-avatar color="deep-purple lighten-5" size="48" class="mb-4">
            <v-icon color="primary">{{ categoryIcon }}</v-icon>
          </v-avatar>
          <h2 class="text-h6 font-weight-bold mb-2">
            {{ title || "Your next big thing" }}
          </h2>
          <p class="text-body-2 muted-copy" style="line-height: 1.65;">
            {{
              description ||
              "A clear description makes it easier to get started and keep moving."
            }}
          </p>
          <div class="d-flex flex-wrap align-center mt-5">
            <div class="status-pill status-todo">To do</div>
            <div
              class="ml-2 status-pill"
              :class="`priority-preview-${priority.toLowerCase()}`"
            >
              <span
                class="priority-dot"
                :class="`priority-${priority.toLowerCase()}`"
              />
              {{ priority }} priority
            </div>
          </div>
          <v-divider class="my-5" />
          <div class="d-flex justify-space-between text-caption mb-3">
            <span class="muted-copy">Due date</span>
            <span class="font-weight-bold">{{
              dueDate ? formatDate(dueDate) : "Choose a date"
            }}</span>
          </div>
          <div class="d-flex justify-space-between text-caption">
            <span class="muted-copy">Effort</span>
            <span class="font-weight-bold">{{ estimate }} hours</span>
          </div>
        </v-card>
        <div class="d-flex align-start mt-5 px-2">
          <v-icon color="accent" small class="mt-1 mr-2"
            >mdi-lightbulb-outline</v-icon
          >
          <div class="text-caption muted-copy" style="line-height: 1.65;">
            Keep the task focused on one outcome. You can always add another
            step later.
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
function toLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default {
  middleware: "authenticated",
  data() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return {
      title: "",
      busy: false,
      formError: "",
      description: "",
      category: "Product",
      priority: "Medium",
      estimate: 2,
      dueDate: toLocalDateInputValue(date),
      dueTime: "17:00",
      location: "Remote",
      categories: ["Product", "Design", "Engineering", "Research", "Planning"],
      priorities: ["High", "Medium", "Low"],
      estimates: [
        { label: "1 hour", value: 1 },
        { label: "2 hours", value: 2 },
        { label: "4 hours", value: 4 },
        { label: "6 hours", value: 6 },
        { label: "8 hours", value: 8 },
        { label: "12 hours", value: 12 },
      ],
    };
  },
  computed: {
    minimumDate() {
      return toLocalDateInputValue(new Date());
    },
    formIsValid() {
      return Boolean(
        this.title.trim() &&
          this.description.trim() &&
          this.dueDate &&
          this.dueTime &&
          Number(this.estimate) > 0
      );
    },
    categoryIcon() {
      return {
        Product: "mdi-rocket-launch-outline",
        Design: "mdi-palette-outline",
        Engineering: "mdi-code-tags",
        Research: "mdi-magnify",
        Planning: "mdi-compass-outline",
      }[this.category];
    },
  },
  methods: {
    formatDate(value) {
      const [year, month, day] = value.split("-").map(Number);
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    },
    async onCreateTask() {
      if (!this.formIsValid) {
        return;
      }
      this.busy = true;
      this.formError = "";
      try {
        await this.$store.dispatch("createTask", {
          title: this.title,
          description: this.description,
          category: this.category,
          priority: this.priority,
          estimate: this.estimate,
          dueDate: new Date(`${this.dueDate}T${this.dueTime}`).toISOString(),
          location: this.location,
          clientName: this.$store.state.userName || this.$config.ownerName,
        });
        await this.$router.push("/tasks");
      } catch (error) {
        this.formError =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "The task could not be saved. Check your API connection and try again.";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped>
.priority-preview-high,
.priority-preview-medium,
.priority-preview-low {
  background: #f7f7fb;
}
</style>
