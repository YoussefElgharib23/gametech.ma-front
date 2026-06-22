export default defineNuxtRouteMiddleware(async (to, from) => {
  const { checkAuth } = useAuth();

  // Check if user is authenticated
  const isAuth = await checkAuth();

  if (isAuth) {
    // Redirect to dashboard if already authenticated
    const redirect = to.query.redirect as string;
    return navigateTo(redirect || "/dashboard");
  }
});
