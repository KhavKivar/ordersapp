import { FloatingButton } from "@/components/ui/FloatingButton/floatingButton";
import OrderCard from "@/features/components/OrderCard";
import { deleteOrder } from "@/features/orders/api/delete-order";
import { getOrders } from "@/features/orders/api/get-orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export default function OrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const { mutate: removeOrder, isPending: removePending } = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2   px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <p className="max-w-2xl text-base text-muted-foreground">
          Revisa los pedidos creados, su estado y el detalle de productos.
        </p>
        <section className="space-y-4">
          <div className="grid gap-4">
            {isPending && <div>Cargando...</div>}
            {error && <div>Error cargando pedidos</div>}
            {data?.orders.map((order) => (
              <OrderCard
                key={order.orderId}
                id={order.orderId}
                clientName={order.clientName ?? "Cliente"}
                status="pending"
                createdAt={order.createdAt}
                items={order.lines.map((item) => ({
                  name: item.productName ?? "Producto",
                  quantity: item.quantity,
                  pricePerUnit: item.pricePerUnit,
                }))}
                onDelete={removePending ? undefined : removeOrder}
              />
            ))}
          </div>
        </section>
      </div>
      <FloatingButton
        label="Agregar pedido"
        title="Agregar pedido"
        onClick={() => navigate("/orders/new")}
      />
    </div>
  );
}
