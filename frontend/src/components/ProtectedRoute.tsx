import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard
    const dashboardMap: Record<string, string> = {
      breeder: "/breeder-dashboard",
      trainer: "/trainer-dashboard",
      superadmin: "/superadmin-dashboard",
      admin: "/superadmin-dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/auth"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
