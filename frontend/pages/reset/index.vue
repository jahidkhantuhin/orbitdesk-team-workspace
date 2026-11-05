<template>
  <div class="auth-shell">
    <v-card flat class="surface-card auth-card pa-6 pa-sm-9">
      <div class="text-center mb-7">
        <span class="brand-mark mb-4">
          <v-icon color="white" size="21">mdi-check-decagram</v-icon>
        </span>
        <div class="eyebrow mb-2">A fresh start</div>
        <h1 class="text-h4 font-weight-bold mb-2">Reset your password</h1>
        <p class="muted-copy mb-0">
          We'll send a secure, one-time link if that address has an account.
        </p>
      </div>

      <v-alert v-if="message" :type="sent ? 'success' : 'error'" dense text>
        {{ message }}
        <div v-if="resetUrl" class="mt-2">
          Local development reset link:
          <a :href="resetUrl" class="font-weight-bold">
            Choose a new password
          </a>
        </div>
      </v-alert>
      <form v-if="!sent" @submit.prevent="requestReset">
        <label class="form-label" for="email">Email address</label>
        <v-text-field
          id="email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          required
          outlined
          dense
          hide-details
          placeholder="you@example.com"
          class="mb-6"
        />
        <v-btn
          type="submit"
          color="primary"
          depressed
          block
          large
          class="text-none"
          :loading="busy"
        >
          Send reset link
          <v-icon right small>mdi-arrow-right</v-icon>
        </v-btn>
      </form>

      <div class="text-center mt-6">
        <nuxt-link
          to="/signin"
          class="text-body-2 font-weight-bold text-decoration-none"
        >
          <v-icon left small>mdi-arrow-left</v-icon>
          Back to sign in
        </nuxt-link>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      busy: false,
      sent: false,
      message: "",
      resetUrl: "",
    };
  },
  head() {
    return { title: "Reset password" };
  },
  methods: {
    async requestReset() {
      this.busy = true;
      this.message = "";
      try {
        const response = await this.$store.dispatch(
          "requestPasswordReset",
          this.email
        );
        this.sent = true;
        this.message = response.message;
        if (response.resetUrl) {
          this.resetUrl = response.resetUrl;
        }
      } catch (error) {
        this.message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "Password recovery is unavailable right now. Please try again later.";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
