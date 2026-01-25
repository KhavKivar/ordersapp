import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import {
  addSelectedPurchaseOrder,
  removeSelectedPurchaseOrder,
  selectedPurchaseOrder,
} from "@/app/purchaseOrderSlice";
import { Button } from "@/components/ui/Button/button";
import {
  getOrders,
  type OrderListItem,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { useAppSelector } from "@/hooks/redux.hooks";

export default function PurchaseOrderSelectPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOrders = useAppSelector(selectedPurchaseOrder);

  const {
    data: ordersData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const ordersDataFiltered = ordersData?.orders.filter(
    (order) => order.purchaseOrderId === null,
  );

  const handleToggleOrder = (order: OrderListItem) => {
    const isSelected = selectedOrders.some(
      (selected) => selected.orderId === order.orderId,
    );
    if (isSelected) {
      dispatch(removeSelectedPurchaseOrder(order));
      return;
    }
    dispatch(addSelectedPurchaseOrder(order));
  };

  const handleGoToSummary = () => {
    if (selectedOrders.length === 0) {
      return;
    }
    navigate("/purchase-order/new/summary");
  };

  return (
    <>
      <p className="max-w-2xl text-base text-muted-foreground">
        Selecciona los pedidos para crear la orden de compra.
      </p>
      <section className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedOrders.length
                ? `Pedidos seleccionados: ${selectedOrders.length}`
                : "Selecciona pedidos para continuar."}
            </p>
            <Button
              variant="primary"
              onClick={handleGoToSummary}
              disabled={selectedOrders.length === 0}
            >
              Continuar
            </Button>
          </div>
          {isPending && <div>Cargando pedidos...</div>}
          {error && <div>Error cargando pedidos</div>}
          <div className="grid gap-4">
            {ordersDataFiltered?.map((order) => (
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
                }))}
                isSelected={selectedOrders.some(
                  (selected) => selected.orderId === order.orderId,
                )}
                onClick={() => handleToggleOrder(order)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
