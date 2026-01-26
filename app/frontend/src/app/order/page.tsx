import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { deleteOrder } from "@/features/orders/api/delete-order";
import {
  getOrders,
  type OrderListItem,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { Plus } from "lucide-react";

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
      toast.success("Pedido eliminado");
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
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2   px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <Button
          variant="primary"
          onClick={() => navigate("/order/new")}
          className="h-12 w-full rounded-2xl shadow-md shadow-emerald-100 sm:h-10 sm:w-auto sm:px-6"
        >
          <Plus className="mr-2 size-5 sm:size-4" />
          Crear pedido
        </Button>

        <section className="space-y-4">
          <div className="grid gap-4">
            {isPending && <div>Cargando...</div>}
            {error && <div>Error cargando pedidos</div>}
            {data?.orders.map((order) => (
              <OrderCard
                key={order.orderId}
                id={order.orderId}
                localName={order.localName ?? "Local"}
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
