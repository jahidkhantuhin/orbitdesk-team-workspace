<template>
  <div class="auth-shell">
    <v-card flat class="surface-card auth-card pa-6 pa-sm-9">
      <div class="text-center mb-7">
        <span class="brand-mark mb-4">
          <v-icon color="white" size="21">mdi-check-decagram</v-icon>
        </span>
        <div class="eyebrow mb-2">A little more focus, a lot more flow</div>
        <h1 class="text-h4 font-weight-bold mb-2">Welcome back</h1>
        <p class="muted-copy mb-0">
          Sign in to pick up right where you left off.
        </p>
      </div>

      <v-alert v-if="errorMessage" type="error" dense text class="mb-5">
        {{ errorMessage }}
      </v-alert>

      <form @submit.prevent="onSignin">
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
        <label class="form-label" for="password">Password</label>
        <v-text-field
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          outlined
          dense
          hide-details
          placeholder="Enter your password"
          class="mb-6"
        />
        <div class="d-flex justify-end mt-n4 mb-5">
          <nuxt-link
            to="/reset"
            class="text-caption font-weight-bold text-decoration-none"
          >
            Forgot password?
          </nuxt-link>
        </div>
        <v-btn
          type="submit"
          color="primary"
          depressed
          block
          large
          class="text-none"
          :loading="busy"
          :disabled="busy"
        >
          Sign in
          <v-icon right small>mdi-arrow-right</v-icon>
        </v-btn>
      </form>

      <div class="d-flex align-center my-5">
        <v-divider />
        <span class="text-caption muted-copy px-3">OR</span>
        <v-divider />
      </div>

      <v-btn
        outlined
        block
        large
        class="text-none"
        :disabled="busy"
        @click="enterDemo"
      >
        <v-icon left color="primary">mdi-play-circle-outline</v-icon>
        Explore with demo data
      </v-btn>
      <p class="text-caption muted-copy text-center mt-3 mb-0">
        Uses a local demo account seeded in MongoDB. Configure demo credentials
        in the frontend and API environment files.
      </p>

      <v-divider class="my-6" />
      <div class="text-body-2 text-center">
        New to {{ $config.appName }}?
        <nuxt-link to="/signup" class="font-weight-bold text-decoration-none"
          >Create an account</nuxt-link
        >
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      busy: false,
      errorMessage: "",
    };
  },
  head() {
    return { title: "Sign in" };
  },
  methods: {
    async onSignin() {
      this.busy = true;
      this.errorMessage = "";
      try {
        await this.$store.dispatch("signUserIn", {
          email: this.email,
          password: this.password,
        });
        await this.$router.push("/");
      } catch (error) {
        this.errorMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "We couldn't sign you in. Check your details and try again.";
      } finally {
        this.busy = false;
      }
    },
    async enterDemo() {
      this.busy = true;
      this.errorMessage = "";
      try {
        await this.$store.dispatch("signUserIn", {
          demo: true,
          email: this.$config.demoEmail,
          password: this.$config.demoPassword,
        });
        await this.$router.push("/");
      } catch (error) {
        this.errorMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          "The demo couldn't be opened. Please try again.";
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
