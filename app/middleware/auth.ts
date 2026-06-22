export default defineNuxtRouteMiddleware(async (to, from) => {
  const { checkAuth, isAuthenticated } = useAuth();

  // Skip auth check for login page
  if (to.path === "/login") {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated.value) {
      return navigateTo("/dashboard");
    }
    return;
  }

  // Check if user is authenticated
  const isAuth = await checkAuth();

  if (!isAuth) {
    // Store intended URL for redirect after login
    if (to.path !== "/login") {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
  }
});
