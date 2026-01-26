import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { deleteOrder } from "@/features/orders/api/delete-order";
import {
  getOrders,
  type OrderListItem,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";

export default function OrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { orderId: number; order: OrderListItem }) =>
      deleteOrder(payload.orderId),
    onSuccess: () => {
      toast.success("Pedido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el pedido.";
      toast.error(message);
    },
  });

  const handleDelete = (order: OrderListItem) => {
    if (deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate({ orderId: order.orderId, order });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-8 sm:px-6">
        {/* HEADER SECTION */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Lista de Pedidos
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {data?.orders.length ?? 0} registros encontrados
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/order/new")}
            className="group h-12 w-full rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:w-auto sm:px-8"
          >
            <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
            Nuevo Pedido
          </Button>
        </header>

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="size-12 animate-spin rounded-full border-4 border-slate-200 border-t-rose-600 mb-4" />
            <p className="font-bold tracking-tight">Cargando pedidos...</p>
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-center">
            <p className="font-bold text-rose-600">Error al cargar la lista</p>
            <p className="mt-1 text-sm text-rose-500/80">
              Por favor intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isPending && !error && data?.orders.length === 0 && (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300 mb-4">
              <ShoppingBag className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay pedidos</h3>
            <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">
              Aún no has registrado ningún pedido. Pulsa el botón de arriba para
              comenzar.
            </p>
          </div>
        )}

        {/* LIST SECTION */}
        <section className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {data?.orders.map((order) => (
              <OrderCard
                key={order.orderId}
                id={order.orderId}
                localName={order.localName ?? "Cliente Local"}
                status="pending"
                createdAt={order.createdAt}
                items={order.lines.map((item) => ({
                  name: item.productName ?? "Producto",
                  quantity: item.quantity,
                  pricePerUnit: item.pricePerUnit,
                  buyPriceSupplier: item.buyPriceSupplier,
                }))}
                onEdit={(orderId) => navigate(`/order/${orderId}/edit`)}
                onDelete={() => handleDelete(order)}
                isSelected={false}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
