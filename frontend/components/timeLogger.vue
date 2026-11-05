<template>
  <v-card flat class="surface-card pa-5 pa-sm-6">
    <div class="d-flex flex-wrap align-center justify-space-between mb-5">
      <div>
        <div class="eyebrow mb-1">Time & focus</div>
        <h2 class="text-h6 font-weight-bold mb-0">Make your effort visible</h2>
      </div>
      <v-btn
        :color="tracking ? 'error' : 'primary'"
        :outlined="tracking"
        depressed
        class="text-none mt-3 mt-sm-0"
        @click="toggleTracking"
      >
        <v-icon left small>{{ tracking ? "mdi-stop" : "mdi-play" }}</v-icon>
        {{ tracking ? "Stop timer" : "Start timer" }}
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" sm="4">
        <div class="text-caption muted-copy mb-1">Time invested</div>
        <div class="text-h5 font-weight-bold">
          {{ formatDuration(totalTracked) }}
        </div>
        <div class="text-caption muted-copy mt-1">Across all your sessions</div>
      </v-col>
      <v-col cols="12" sm="4">
        <div class="text-caption muted-copy mb-1">Time to due date</div>
        <div
          class="text-h5 font-weight-bold"
          :class="{ 'error--text': remainingSeconds < 0 }"
        >
          {{ formatRemaining(remainingSeconds) }}
        </div>
        <div class="text-caption muted-copy mt-1">
          {{
            remainingSeconds < 0
              ? "This task is past its due date"
              : formatDate(dueDate)
          }}
        </div>
      </v-col>
      <v-col cols="12" sm="4">
        <div class="text-caption muted-copy mb-1">Planned effort</div>
        <div class="text-h5 font-weight-bold">{{ estimate }}h</div>
        <div class="text-caption muted-copy mt-1">
          {{ progressLabel }} of your estimate
        </div>
      </v-col>
    </v-row>

    <div class="progress-track mt-4">
      <span :style="{ width: progress + '%' }" />
    </div>
    <div
      v-if="tracking"
      class="text-caption primary--text font-weight-bold mt-3"
    >
      Timer running - {{ formatDuration(sessionSeconds) }} this session
    </div>
  </v-card>
</template>

<script>
export default {
  props: {
    dueDate: { type: String, required: true },
    estimate: { type: Number, default: 1 },
    trackedSeconds: { type: Number, default: 0 },
  },
  data() {
    return {
      now: Date.now(),
      tracking: false,
      startedAt: null,
      sessionSeconds: 0,
      intervalId: null,
    };
  },
  computed: {
    remainingSeconds() {
      return Math.floor((new Date(this.dueDate).getTime() - this.now) / 1000);
    },
    totalTracked() {
      return (Number(this.trackedSeconds) || 0) + this.sessionSeconds;
    },
    progress() {
      const plannedSeconds = Math.max(1, this.estimate * 3600);
      return Math.min(
        100,
        Math.round((this.totalTracked / plannedSeconds) * 100)
      );
    },
    progressLabel() {
      return this.progress >= 100 ? "Estimate reached" : `${this.progress}%`;
    },
  },
  mounted() {
    this.intervalId = window.setInterval(() => {
      this.now = Date.now();
      if (this.tracking) {
        this.sessionSeconds = Math.floor((this.now - this.startedAt) / 1000);
      }
    }, 1000);
  },
  beforeDestroy() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  },
  methods: {
    formatDuration(value) {
      const seconds = Math.max(0, Number(value) || 0);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, "0")}m`;
      }
      return `${String(minutes).padStart(2, "0")}m ${String(
        seconds % 60
      ).padStart(2, "0")}s`;
    },
    formatRemaining(value) {
      const seconds = Math.abs(value);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${value < 0 ? "-" : ""}${days}d ${hours}h ${minutes}m`;
    },
    formatDate(value) {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value));
    },
    toggleTracking() {
      if (this.tracking) {
        this.tracking = false;
        if (this.sessionSeconds > 0) {
          this.$emit("log-time", this.sessionSeconds);
        }
        this.sessionSeconds = 0;
        this.startedAt = null;
        return;
      }
      this.startedAt = Date.now();
      this.tracking = true;
    },
  },
};
</script>
