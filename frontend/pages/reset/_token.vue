<template>
  <div class="auth-shell">
    <v-card flat class="surface-card auth-card pa-6 pa-sm-9">
      <div class="text-center mb-7">
        <span class="brand-mark mb-4">
          <v-icon color="white" size="21">mdi-check-decagram</v-icon>
        </span>
        <div class="eyebrow mb-2">Almost there</div>
        <h1 class="text-h4 font-weight-bold mb-2">Choose a new password</h1>
        <p class="muted-copy mb-0">
          Use at least 8 characters to keep your account secure.
        </p>
      </div>

      <v-alert v-if="message" :type="updated ? 'success' : 'error'" dense text>
        {{ message }}
      </v-alert>
      <form v-if="!updated" @submit.prevent="updatePassword">
        <label class="form-label" for="password">New password</label>
        <v-text-field
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          outlined
          dense
          hide-details
          class="mb-5"
        />
        <label class="form-label" for="confirm-password"
          >Confirm new password</label
        >
        <v-text-field
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          outlined
          dense
          hide-details="auto"
          :error-messages="passwordMismatch ? ['Passwords do not match'] : []"
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
          :disabled="busy || !formIsValid"
        >
          Update password
          <v-icon right small>mdi-arrow-right</v-icon>
        </v-btn>
      </form>

      <v-btn
        v-if="updated"
        to="/signin"
        color="primary"
        depressed
        block
        large
        class="text-none"
      >
        Back to sign in
      </v-btn>
      <div v-else class="text-center mt-6">
        <nuxt-link
          to="/reset"
          class="text-body-2 font-weight-bold text-decoration-none"
        >
          Request another reset link
        </nuxt-link>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      confirmPassword: "",
      busy: false,
      updated: false,
      message: "",
    };
  },
  head() {
    return { title: "Choose a new password" };
  },
  computed: {
    passwordMismatch() {
      return (
        this.confirmPassword.length > 0 &&
        this.password !== this.confirmPassword
      );
    },
    formIsValid() {
      return Boolean(
        this.password.length >= 8 &&
          this.password === this.confirmPassword &&
          this.$route.params.token
      );
    },
  },
  methods: {
    async updatePassword() {
      if (!this.formIsValid) {
        return;
      }
      this.busy = true;
      this.message = "";
      try {
        const response = await this.$store.dispatch("updatePassword", {
          token: this.$route.params.token,
          password: this.password,
        });
        this.updated = true;
        this.message = response.message;
      } catch (error) {
        this.message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "This reset link isn't available. Request a new one and try again.";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
