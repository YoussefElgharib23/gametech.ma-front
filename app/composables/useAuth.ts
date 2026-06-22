export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export const useAuth = () => {
  const { public: config } = useRuntimeConfig();

  // State
  const user = useState<User | null>("auth:user", () => null);
  const token = useCookie<string | null>("token", {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = ref(false);

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      const response = await sanctumFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: credentials,
      });

      // Store token in cookie
      token.value = response.token;

      // Set user state
      user.value = response.user;

      return { success: true };
    } catch (error: any) {
      const message = error?.data?.message || "Une erreur s'est produite lors de la connexion.";
      return { success: false, error: message };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true;

    try {
      await sanctumFetch("/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
    } catch (error) {
      // Silently handle error - we still want to clear local state
    } finally {
      // Clear state regardless of API response
      user.value = null;
      token.value = null;
      isLoading.value = false;

      // Redirect to login page
      await navigateTo("/login");
    }
  };

  /**
   * Fetch current authenticated user
   */
  const fetchUser = async (): Promise<boolean> => {
    if (!token.value) {
      user.value = null;
      return false;
    }

    try {
      const response = await $fetch<MeResponse>("/auth/me", {
        baseURL: config.apiBaseUrl,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        credentials: "include",
      });

      user.value = response.user;
      return true;
    } catch (error: any) {
      // If 401, clear token as it's invalid
      if (error?.status === 401 || error?.statusCode === 401) {
        token.value = null;
      }
      user.value = null;
      return false;
    }
  };

  /**
   * Check if user is authenticated (for middleware use)
   */
  const checkAuth = async (): Promise<boolean> => {
    // If we already have user data, we're authenticated
    if (user.value) {
      return true;
    }

    // Otherwise try to fetch user
    return await fetchUser();
  };

  /**
   * Initialize auth state on app start
   */
  const initAuth = async (): Promise<void> => {
    if (token.value && !user.value) {
      await fetchUser();
    }
  };

  return {
    // State
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    token: readonly(token),

    // Methods
    login,
    logout,
    fetchUser,
    checkAuth,
    initAuth,
  };
};
