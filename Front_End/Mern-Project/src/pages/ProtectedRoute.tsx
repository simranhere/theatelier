import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.utype !== role) return <Navigate to="/login" replace />;

  return <>{children}</>;
}