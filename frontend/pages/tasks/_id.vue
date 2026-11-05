<template>
  <div class="page-content">
    <div v-if="task">
      <div class="d-flex flex-wrap justify-space-between align-center mb-6">
        <v-btn to="/tasks" text small color="grey darken-1" class="text-none">
          <v-icon left small>mdi-arrow-left</v-icon>
          All tasks
        </v-btn>
        <div class="d-flex align-center mt-3 mt-sm-0">
          <v-btn outlined small class="text-none mr-2" @click="openEdit">
            <v-icon left small>mdi-pencil-outline</v-icon>
            Edit task
          </v-btn>
          <v-select
            :value="task.status"
            :items="statuses"
            item-text="label"
            item-value="value"
            dense
            outlined
            hide-details
            aria-label="Task status"
            style="max-width: 175px;"
            @change="updateStatus"
          />
          <v-btn
            icon
            class="ml-1"
            aria-label="Delete task"
            @click="confirmDelete = true"
          >
            <v-icon color="grey darken-1">mdi-delete-outline</v-icon>
          </v-btn>
        </div>
      </div>

      <v-card flat class="surface-card overflow-hidden mb-5">
        <div class="detail-cover pa-6 pa-sm-9">
          <div class="d-flex flex-wrap align-center mb-4">
            <span class="status-pill mr-2" :class="`status-${task.status}`">
              {{ statusLabel(task.status) }}
            </span>
            <span class="status-pill priority-tag">
              <span
                class="priority-dot"
                :class="priorityClass(task.priority)"
              />
              {{ task.priority }} priority
            </span>
          </div>
          <h1 class="page-heading mb-3">{{ task.title }}</h1>
          <p
            class="muted-copy mb-0"
            style="max-width: 740px; line-height: 1.7;"
          >
            {{ task.description }}
          </p>
        </div>
        <v-divider />
        <v-row class="px-4 px-sm-7 py-4">
          <v-col cols="6" sm="3">
            <div class="eyebrow mb-2">Category</div>
            <div class="d-flex align-center font-weight-bold">
              <v-icon left small color="primary">{{ categoryIcon }}</v-icon>
              {{ task.category }}
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="eyebrow mb-2">Due date</div>
            <div class="font-weight-bold">{{ formatDate(task.dueDate) }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="eyebrow mb-2">Created</div>
            <div class="font-weight-bold">{{ formatDate(task.createdAt) }}</div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="eyebrow mb-2">Workspace</div>
            <div class="font-weight-bold">{{ task.location || "Remote" }}</div>
          </v-col>
        </v-row>
      </v-card>

      <time-logger
        :key="task.id"
        :due-date="task.dueDate"
        :estimate="Number(task.estimate) || 1"
        :tracked-seconds="Number(task.trackedSeconds) || 0"
        class="mb-5"
        @log-time="logTime"
      />

      <v-row>
        <v-col cols="12" md="7">
          <v-card flat class="surface-card pa-5 pa-sm-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="eyebrow mb-1">The details</div>
                <h2 class="text-h6 font-weight-bold mb-0">
                  A note to future you
                </h2>
              </div>
              <v-icon color="primary">mdi-text-box-outline</v-icon>
            </div>
            <p
              class="text-body-2 mb-0"
              style="color: #6f7388; line-height: 1.8; white-space: pre-line;"
            >
              {{ task.description }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="5">
          <v-card flat class="surface-card pa-5 pa-sm-6">
            <div class="eyebrow mb-1">Your plan</div>
            <h2 class="text-h6 font-weight-bold mb-5">Small steps count</h2>
            <div class="d-flex justify-space-between text-caption mb-2">
              <span class="muted-copy">Effort invested</span>
              <span class="font-weight-bold">{{ progress }}%</span>
            </div>
            <div class="progress-track mb-5">
              <span :style="{ width: `${progress}%` }" />
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-3">
              <span class="muted-copy">Estimated effort</span>
              <span class="font-weight-bold"
                >{{ task.estimate || 1 }} hours</span
              >
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="muted-copy">Priority</span>
              <span class="font-weight-bold">
                <span
                  class="priority-dot"
                  :class="priorityClass(task.priority)"
                />
                {{ task.priority }}
              </span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-card v-else flat class="surface-card text-center pa-8 pa-sm-12">
      <v-avatar color="deep-purple lighten-5" size="62">
        <v-icon color="primary" size="28">mdi-file-question-outline</v-icon>
      </v-avatar>
      <h1 class="text-h6 font-weight-bold mt-4 mb-2">
        We couldn't find that task
      </h1>
      <p class="muted-copy mb-5">
        It may have been removed from this workspace.
      </p>
      <v-btn to="/tasks" color="primary" depressed class="text-none"
        >Back to tasks</v-btn
      >
    </v-card>

    <v-dialog v-model="confirmDelete" max-width="420">
      <v-card class="pa-2">
        <v-card-title class="text-h6 font-weight-bold"
          >Delete this task?</v-card-title
        >
        <v-card-text class="muted-copy">
          <v-alert v-if="deleteError" type="error" dense text>
            {{ deleteError }}
          </v-alert>
          This will remove "{{ task && task.title }}" from your workspace.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn text class="text-none" @click="confirmDelete = false"
            >Keep task</v-btn
          >
          <v-btn
            color="error"
            depressed
            class="text-none"
            :loading="deleting"
            @click="deleteTask"
            >Delete task</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="640" persistent>
      <v-card class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">Edit task</v-card-title>
        <v-card-text>
          <v-alert v-if="editError" type="error" dense text>
            {{ editError }}
          </v-alert>
          <v-text-field
            v-model.trim="editForm.title"
            label="Task name"
            outlined
            dense
            maxlength="100"
          />
          <v-textarea
            v-model.trim="editForm.description"
            label="Description"
            outlined
            rows="3"
            maxlength="1000"
          />
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editForm.category"
                :items="categories"
                label="Category"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editForm.priority"
                :items="priorities"
                label="Priority"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.dueDate"
                type="date"
                label="Due date"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.dueTime"
                type="time"
                label="Due time"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="editForm.estimate"
                type="number"
                min="0.25"
                max="500"
                step="0.25"
                label="Estimated hours"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.trim="editForm.location"
                label="Workspace"
                maxlength="60"
                outlined
                dense
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn
            text
            class="text-none"
            :disabled="saving"
            @click="editDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            class="text-none"
            :loading="saving"
            :disabled="!editFormIsValid"
            @click="saveTask"
          >
            Save changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TimeLogger from "~/components/timeLogger.vue";

export default {
  components: { TimeLogger },
  middleware: "authenticated",
  data() {
    return {
      confirmDelete: false,
      editDialog: false,
      saving: false,
      deleting: false,
      deleteError: "",
      editError: "",
      categories: ["Product", "Design", "Engineering", "Research", "Planning"],
      priorities: ["High", "Medium", "Low"],
      editForm: {
        title: "",
        description: "",
        category: "Product",
        priority: "Medium",
        dueDate: "",
        dueTime: "17:00",
        estimate: 1,
        location: "Remote",
      },
      statuses: [
        { label: "To do", value: "todo" },
        { label: "In progress", value: "in-progress" },
        { label: "In review", value: "review" },
        { label: "Completed", value: "completed" },
      ],
    };
  },
  computed: {
    editFormIsValid() {
      return Boolean(
        this.editForm.title.trim() &&
          this.editForm.description.trim() &&
          this.editForm.dueDate &&
          this.editForm.dueTime &&
          Number(this.editForm.estimate) >= 0.25 &&
          Number(this.editForm.estimate) <= 500
      );
    },
    task() {
      return this.$store.getters.singleTask(this.$route.params.id);
    },
    progress() {
      if (!this.task) {
        return 0;
      }
      return Math.min(
        100,
        Math.round(
          ((Number(this.task.trackedSeconds) || 0) /
            (Math.max(1, Number(this.task.estimate) || 1) * 3600)) *
            100
        )
      );
    },
    categoryIcon() {
      return (
        {
          Product: "mdi-rocket-launch-outline",
          Design: "mdi-palette-outline",
          Engineering: "mdi-code-tags",
          Research: "mdi-magnify",
          Planning: "mdi-compass-outline",
        }[(this.task && this.task.category) || ""] ||
        "mdi-checkbox-marked-circle-outline"
      );
    },
  },
  methods: {
    openEdit() {
      const dueDate = new Date(this.task.dueDate);
      this.editError = "";
      this.editForm = {
        title: this.task.title,
        description: this.task.description,
        category: this.task.category,
        priority: this.task.priority,
        dueDate: `${dueDate.getFullYear()}-${String(
          dueDate.getMonth() + 1
        ).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`,
        dueTime: `${String(dueDate.getHours()).padStart(2, "0")}:${String(
          dueDate.getMinutes()
        ).padStart(2, "0")}`,
        estimate: Number(this.task.estimate) || 1,
        location: this.task.location || "Remote",
      };
      this.editDialog = true;
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
      return `priority-${(priority || "medium").toLowerCase()}`;
    },
    formatDate(value) {
      return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value));
    },
    async updateStatus(status) {
      try {
        await this.$store.dispatch("updateTask", {
          id: this.task.id,
          changes: { status },
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
    async logTime(seconds) {
      try {
        await this.$store.dispatch("updateTask", {
          id: this.task.id,
          changes: {
            trackedSeconds: (Number(this.task.trackedSeconds) || 0) + seconds,
          },
        });
      } catch (error) {
        this.$store.commit(
          "setTaskError",
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            "Tracked time could not be saved."
        );
      }
    },
    async saveTask() {
      if (!this.editFormIsValid) {
        return;
      }
      this.saving = true;
      this.editError = "";
      try {
        await this.$store.dispatch("updateTask", {
          id: this.task.id,
          changes: {
            title: this.editForm.title,
            description: this.editForm.description,
            category: this.editForm.category,
            priority: this.editForm.priority,
            dueDate: new Date(
              `${this.editForm.dueDate}T${this.editForm.dueTime}`
            ).toISOString(),
            estimate: Number(this.editForm.estimate),
            location: this.editForm.location,
          },
        });
        this.editDialog = false;
      } catch (error) {
        this.editError =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "Changes could not be saved. Please try again.";
      } finally {
        this.saving = false;
      }
    },
    async deleteTask() {
      this.deleting = true;
      this.deleteError = "";
      try {
        await this.$store.dispatch("deleteTask", this.task.id);
        this.confirmDelete = false;
        await this.$router.push("/tasks");
      } catch (error) {
        this.deleteError =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "The task could not be deleted. Please try again.";
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>

<style scoped>
.detail-cover {
  background: radial-gradient(
      ellipse at 92% 10%,
      rgba(111, 95, 231, 0.1),
      transparent 36%
    ),
    #fff;
}

.priority-tag {
  background: #f7f7fb;
  color: #777b91;
}
</style>
