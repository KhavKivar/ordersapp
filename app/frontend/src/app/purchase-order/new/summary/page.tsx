import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  cleanSelectedPurchaseOrder,
  selectedPurchaseOrder,
} from "@/app/purchaseOrderSlice";
import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
import { Spacer } from "@/components/ui/Spacer/spacer";
import { createPurchaseOrder } from "@/features/purchase-orders/api/create-purchase-orders";
import { useAppSelector } from "@/hooks/redux.hooks";
import { formatChileanPeso } from "@/utils/format-currency";

type PurchaseItem = {
  productId: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
};

export default function PurchaseOrderSummaryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOrders = useAppSelector(selectedPurchaseOrder);

  const purchaseOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      dispatch(cleanSelectedPurchaseOrder());
      navigate("/purchase-order", { replace: true });
      toast.success("Orden de compra creada");
    },
    onError: () => {
      toast.error("No se pudo crear la orden de compra");
    },
  });

  const purchaseItems = useMemo<PurchaseItem[]>(() => {
    const merged = new Map<number, PurchaseItem>();
    selectedOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const existing = merged.get(line.productId);
        if (existing) {
          existing.quantity += line.quantity;
          return;
        }
        merged.set(line.productId, {
          productId: line.productId,
          name: line.productName ?? "Producto",
          quantity: line.quantity,
          pricePerUnit:
            (line as { buyPriceSupplier?: number }).buyPriceSupplier ??
            line.pricePerUnit,
        });
      });
    });
    return Array.from(merged.values());
  }, [selectedOrders]);

  const total = useMemo(
    () =>
      purchaseItems.reduce(
        (sum, item) => sum + item.pricePerUnit * item.quantity,
        0,
      ),
    [purchaseItems],
  );

  const handleCreatePurchaseOrder = () => {
    if (purchaseItems.length === 0 || purchaseOrderMutation.isPending) {
      return;
    }

    purchaseOrderMutation.mutate({
      orderListIds: selectedOrders.map((order) => order.orderId),
    });
  };

  const handleBackToSelect = () => {
    navigate("/purchase-order/new/select");
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-base text-muted-foreground">
          Resumen de compra con el detalle de productos y el total.
        </p>
        <Button variant="outline" onClick={handleBackToSelect}>
          Cambiar pedidos
        </Button>
      </div>
      <section className="space-y-6">
        <Card className="rounded-3xl border border-border bg-card/90 p-6 text-left">
          <h2 className="text-lg font-semibold text-foreground">
            Resumen de compra
          </h2>
          <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-white/80">
            {purchaseItems.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Agrega pedidos para consolidar productos.
              </p>
            ) : (
              purchaseItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatChileanPeso(item.pricePerUnit)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatChileanPeso(item.pricePerUnit * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
            <span>Total estimado</span>
            <span className="text-base font-semibold text-foreground">
              {formatChileanPeso(total)}
            </span>
          </div>
          <Spacer size={5} />
          <Button
            variant="primary"
            onClick={handleCreatePurchaseOrder}
            disabled={
              purchaseItems.length === 0 || purchaseOrderMutation.isPending
            }
          >
            {purchaseOrderMutation.isPending
              ? "Creando..."
              : "Crear orden de compra"}
          </Button>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-card/90 p-6 text-left">
          <h2 className="text-lg font-semibold text-foreground">
            Pedidos seleccionados
          </h2>
          <div className="mt-4 space-y-3">
            {selectedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay pedidos seleccionados.
              </p>
            ) : (
              selectedOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="rounded-2xl border border-border/60 bg-white/80 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Pedido #{order.orderId}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {order.localName ?? "Local"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-white">
                    {order.lines.map((line) => (
                      <div
                        key={line.lineId}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-foreground">
                            {line.productName ?? "Producto"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {line.quantity} x{" "}
                            {formatChileanPeso(line.pricePerUnit)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatChileanPeso(line.pricePerUnit * line.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
