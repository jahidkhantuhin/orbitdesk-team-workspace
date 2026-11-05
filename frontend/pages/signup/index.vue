<template>
  <div class="auth-shell">
    <v-card flat class="surface-card auth-card pa-6 pa-sm-9">
      <div class="text-center mb-7">
        <span class="brand-mark mb-4">
          <v-icon color="white" size="21">mdi-check-decagram</v-icon>
        </span>
        <div class="eyebrow mb-2">Your work deserves a good home</div>
        <h1 class="text-h4 font-weight-bold mb-2">Make space for progress</h1>
        <p class="muted-copy mb-0">
          Create your {{ $config.appName }} account and start with intention.
        </p>
      </div>

      <v-alert v-if="errorMessage" type="error" dense text class="mb-5">
        {{ errorMessage }}
      </v-alert>

      <form @submit.prevent="onSignup">
        <label class="form-label" for="name">Your name</label>
        <v-text-field
          id="name"
          v-model.trim="name"
          autocomplete="name"
          required
          outlined
          dense
          hide-details
          maxlength="80"
          class="mb-5"
        />
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
          class="mb-5"
        />
        <label class="form-label" for="password">Create a password</label>
        <v-text-field
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          outlined
          dense
          hide-details
          placeholder="At least 8 characters"
          class="mb-5"
        />
        <label class="form-label" for="confirm-password"
          >Confirm password</label
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
          Create account
          <v-icon right small>mdi-arrow-right</v-icon>
        </v-btn>
      </form>

      <div class="d-flex align-center my-5">
        <v-divider />
        <span class="text-caption muted-copy px-3">OR</span>
        <v-divider />
      </div>
      <v-btn to="/signin" outlined block large class="text-none">
        <v-icon left color="primary">mdi-play-circle-outline</v-icon>
        Explore the demo instead
      </v-btn>
      <div class="text-body-2 text-center mt-6">
        Already have an account?
        <nuxt-link to="/signin" class="font-weight-bold text-decoration-none"
          >Sign in</nuxt-link
        >
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "Jahid Khan",
      email: "",
      password: "",
      confirmPassword: "",
      busy: false,
      errorMessage: "",
    };
  },
  head() {
    return { title: "Create an account" };
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
        this.name.trim() &&
          this.email.trim() &&
          this.password.length >= 8 &&
          this.password === this.confirmPassword
      );
    },
  },
  methods: {
    async onSignup() {
      if (!this.formIsValid) {
        return;
      }
      this.busy = true;
      this.errorMessage = "";
      try {
        await this.$store.dispatch("signUserUp", {
          name: this.name,
          email: this.email,
          password: this.password,
        });
        await this.$router.push("/");
      } catch (error) {
        this.errorMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "Account creation isn't available right now. Please try again.";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
