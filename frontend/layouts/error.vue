<template>
  <v-app>
    <v-main class="d-flex align-center justify-center">
      <div class="text-center pa-6">
        <span class="brand-mark mb-5">
          <v-icon color="white">mdi-check-decagram</v-icon>
        </span>
        <div class="eyebrow mb-2">{{ statusCode }}</div>
        <h1 class="page-heading mb-3">{{ title }}</h1>
        <p class="muted-copy mb-6">{{ description }}</p>
        <v-btn to="/" color="primary" depressed class="text-none">
          <v-icon left small>mdi-arrow-left</v-icon>
          Back to {{ $config.appName }}
        </v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    statusCode() {
      return this.error.statusCode || 500;
    },
    title() {
      return this.statusCode === 404
        ? "This page wandered off."
        : "Something went wrong.";
    },
    description() {
      return this.statusCode === 404
        ? "The page you're looking for isn't here, but your next idea still has a place."
        : "Please try again in a moment, or head back to your workspace.";
    },
  },
  head() {
    return {
      title:
        this.statusCode === 404 ? "Page not found" : "Something went wrong",
    };
  },
};
</script>
