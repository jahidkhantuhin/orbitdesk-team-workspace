export default async function ({ store, redirect }) {
  await store.dispatch("initialize");
  if (!store.getters.isAuthenticated) {
    return redirect("/signin");
  }
}
