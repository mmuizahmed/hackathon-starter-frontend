import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword as changePasswordRequest, getCurrentUser, login as loginRequest, logout as logoutRequest } from "../features/auth/api";
import { completeSetup as completeSetupRequest, getSetupStatus } from "../features/setup/api";
import { ApiError } from "../lib/api";
import { isInitialized, userFromPayload } from "../lib/user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setReady(false);
      setError(null);

      try {
        const status = await getSetupStatus({ signal: controller.signal });
        if (!active) return;

        const companyExists = isInitialized(status);
        setInitialized(companyExists);

        if (!companyExists) {
          setUser(null);
          setReady(true);
          return;
        }

        try {
          const me = await getCurrentUser({ signal: controller.signal });
          if (!active) return;
          setUser(userFromPayload(me));
        } catch (meError) {
          if (!active || meError?.name === "AbortError") return;
          // A signed-out visitor is normal. Any other failure blocks the app.
          if (meError instanceof ApiError && meError.status === 401) {
            setUser(null);
          } else {
            throw meError;
          }
        }

        setReady(true);
      } catch (loadError) {
        if (!active || loadError?.name === "AbortError") return;
        setUser(null);
        setError(loadError.message || "Cannot reach the server.");
        setReady(true);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
      if (window.location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    }

    window.addEventListener("hcm:unauthorized", onUnauthorized);
    return () => window.removeEventListener("hcm:unauthorized", onUnauthorized);
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const next = userFromPayload(await loginRequest({ email, password }));
    if (!next) throw new ApiError("The server did not return an account.");
    setInitialized(true);
    setUser(next);
    return next;
  }, []);

  const completeSetup = useCallback(async (payload) => {
    const next = userFromPayload(await completeSetupRequest(payload));
    if (!next) throw new ApiError("Setup finished, but the server did not return the admin account.");
    setInitialized(true);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (logoutError) {
      // A dead session can still be cleared. A network or server error should stay visible.
      const alreadySignedOut = logoutError instanceof ApiError && logoutError.status === 401;
      if (!alreadySignedOut) throw logoutError;
    }
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await changePasswordRequest({ currentPassword, newPassword });

    let next = null;
    try {
      next = userFromPayload(await getCurrentUser());
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) throw refreshError;
    }

    setUser((current) => {
      if (next) return next;
      if (!current) return current;
      return { ...current, mustChangePassword: false };
    });

    return next;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      initialized,
      user,
      error,
      reload,
      login,
      logout,
      changePassword,
      completeSetup,
    }),
    [ready, initialized, user, error, reload, login, logout, changePassword, completeSetup],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
