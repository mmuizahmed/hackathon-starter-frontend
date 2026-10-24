import { useAuth } from "../../context/AuthContext";
import { homePathForRole } from "../../routes/navigation";
import { Button, PageHeader } from "../../components/ui";

export function NotFoundPage() {
  const { user } = useAuth();
  const home = homePathForRole(user?.role) || "/login";

  return (
    <div className="space-y-6">
      <PageHeader title="Page not found" description="That address is not in HCM Lite." />
      <Button to={home}>Back to dashboard</Button>
    </div>
  );
}
