import {
  ArrowRight,
  BarChart3,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card/card";
import { cn } from "@/lib/utils";

// Definimos las opciones del menú para iterar limpiamente
const DASHBOARD_ITEMS = [
  {
    title: "Pedidos",
    description: "Gestionar pedidos de clientes",
    icon: ShoppingBag,
    href: "/order",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  {
    title: "Clientes",
    description: "Directorio de locales",
    icon: Users,
    href: "/client",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-100",
  },
  {
    title: "Compras",
    description: "Órdenes a proveedores",
    icon: Package,
    href: "/purchase-order",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100",
  },
  {
    title: "Estadísticas",
    description: "Reportes y métricas",
    icon: BarChart3,
    href: "/stats",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lógica mejorada del Toast:
  // Usamos useEffect para detectar el mensaje una sola vez al montar
  useEffect(() => {
    if (
      location.state &&
      typeof location.state === "object" &&
      "toast" in location.state
    ) {
      const message = (location.state as { toast: string }).toast;

      // Pequeño delay para que se vea la animación de entrada si vienes de otra página
      setTimeout(() => toast.success(message), 100);

      // Limpiamos el state para que no aparezca de nuevo al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-12 pt-8 sm:pt-12 lg:pt-16">
        {/* ACCIONES RÁPIDAS (GRID) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {DASHBOARD_ITEMS.map((item) => (
            <Card
              key={item.title}
              onClick={() => navigate(item.href)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                "bg-white border-slate-200", // Base style
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors",
                      item.bgColor,
                    )}
                  >
                    <item.icon className={cn("h-6 w-6", item.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-slate-700 text-left">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>

                {/* Flecha que aparece al hacer hover */}
                <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* SECCIÓN RESUMEN (Opcional - Ejemplo visual) */}
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <Store className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Estado del Sistema
            </span>
          </div>
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-2 text-center sm:text-left">
              <span className="block text-2xl font-bold text-slate-900">
                --
              </span>
              <span className="text-xs text-slate-500">Pedidos Hoy</span>
            </div>
            <div className="px-4 py-2 text-center sm:text-left">
              <span className="block text-2xl font-bold text-slate-900">
                --
              </span>
              <span className="text-xs text-slate-500">Por Despachar</span>
            </div>
            <div className="px-4 py-2 text-center sm:text-left">
              <span className="block text-2xl font-bold text-slate-900">
                --
              </span>
              <span className="text-xs text-slate-500">Clientes Activos</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
