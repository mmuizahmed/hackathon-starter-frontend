import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { Spinner } from "../components/ui/Spinner";
import { homePathForRole } from "./navigation";

function safeNextPath(pathname) {
  if (!pathname || pathname === "/login" || pathname === "/setup" || pathname === "/change-password") {
    return null;
  }
  return pathname;
}

export function SessionGate() {
  const { ready, error, reload } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner label="Loading HCM Lite" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md">
          <ErrorState title="Cannot reach HCM Lite" message={error} onRetry={reload} />
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// Signed-out screens. Setup is the only page until the company exists.
export function GuestOnly() {
  const { initialized, user } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return location.pathname === "/setup" ? <Outlet /> : <Navigate to="/setup" replace />;
  }

  if (location.pathname === "/setup") {
    if (!user) return <Navigate to="/login" replace />;
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
    return <Navigate to={homePathForRole(user.role) || "/login"} replace />;
  }

  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (user) return <Navigate to={homePathForRole(user.role) || "/login"} replace />;

  return <Outlet />;
}

export function RequireAuth() {
  const { initialized, user } = useAuth();
  const location = useLocation();

  if (!initialized) return <Navigate to="/setup" replace />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: safeNextPath(location.pathname) }} />;
  }
  return <Outlet />;
}

// Sits inside RequireAuth, around the app shell, not around /change-password.
export function RequireFreshPassword() {
  const { user } = useAuth();
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }) {
  const { user } = useAuth();
  if (user && roles.includes(user.role)) return <Outlet />;

  const home = homePathForRole(user?.role);
  if (!home) return <UnknownRole />;
  return <Navigate to={home} replace />;
}

export function HomeRedirect() {
  const { user } = useAuth();
  const home = homePathForRole(user?.role);
  if (!home) return <UnknownRole />;
  return <Navigate to={home} replace />;
}

function UnknownRole() {
  const { logout } = useAuth();

  return (
    <div className="space-y-4">
      <ErrorState
        title="This account cannot open HCM Lite"
        message="The role on this login is not admin, HR, or employee."
      />
      <Button
        variant="secondary"
        onClick={async () => {
          await logout().catch(() => {});
          window.location.assign("/login");
        }}
      >
        Log out
      </Button>
    </div>
  );
}
