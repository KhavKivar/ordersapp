import { Navigate, Outlet } from "react-router";

export const AuthGuard = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
