import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      setAuth: (token, user) => {
        localStorage.setItem("arena_token", token);
        set({ token, user, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("arena_token");
        set({ token: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: "arena_auth",
      partialize: (state) => ({ token: state.token, user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);
