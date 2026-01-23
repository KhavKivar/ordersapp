import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import Navbar from "@/components/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";

type NavbarConfig = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navbarConfig = useMemo<NavbarConfig>(() => {
    switch (location.pathname) {
      case "/orders":
        return {
          title: "Historial de pedidos",
          showBack: true,
        };
      case "/orders/new":
        return {
          title: "Nuevo pedido manual",
          showBack: true,
        };
      case "/clients/new":
        return {
          title: "Nuevo cliente",
          showBack: true,
        };
      default:
        return {
          title: "Panel Principal",
          subtitle: "Vasvani App",
        };
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      <Toaster />
      <Navbar
        title={navbarConfig.title}
        subtitle={navbarConfig.subtitle}
        showBack={navbarConfig.showBack}
        action={navbarConfig.action}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
