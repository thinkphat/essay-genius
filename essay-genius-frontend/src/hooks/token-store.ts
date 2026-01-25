import { create } from "zustand";
import Cookies from "js-cookie";
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from "@/constants";

type TokenStore = {
  accessToken: string | null;
  actions: {
    setAccessToken: (accessToken: string) => void;
    setRefreshToken: (refreshToken: string) => void;
    getAccessToken: () => string | undefined;
    getRefreshToken: () => string | undefined;
    clearTokens: () => void;
  };
};

export const useTokenStore = create<TokenStore>(
  (set): TokenStore => ({
    accessToken: null,
    actions: {
      setAccessToken: (accessToken) =>
        Cookies.set(COOKIE_KEY_ACCESS_TOKEN, accessToken, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        }),
      setRefreshToken: (refereshToken) =>
        Cookies.set(COOKIE_KEY_REFRESH_TOKEN, refereshToken, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        }),
      getAccessToken: () => Cookies.get(COOKIE_KEY_ACCESS_TOKEN),
      getRefreshToken: () => Cookies.get(COOKIE_KEY_REFRESH_TOKEN),
      clearTokens: () => {
        Cookies.remove(COOKIE_KEY_ACCESS_TOKEN, { path: "/" });
        Cookies.remove(COOKIE_KEY_REFRESH_TOKEN, { path: "/" });
      },
    },
  }),
);

export const useAccessToken = () =>
  useTokenStore((state) => state.actions.getAccessToken());
export const useRefreshToken = () =>
  useTokenStore((state) => state.actions.getRefreshToken());
export const useTokenActions = () => useTokenStore((state) => state.actions);
