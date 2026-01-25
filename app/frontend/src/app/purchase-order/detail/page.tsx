import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
import {
  getOrders,
  type OrderListItem,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { getPurchaseOrder } from "@/features/purchase-orders/api/get-purchase-order";
import { updatePurchaseOrder } from "@/features/purchase-orders/api/update-purchase-order";
import { formatChileanPeso } from "@/utils/format-currency";

type ConsolidatedLine = {
  productId: number;
  productName: string;
  quantity: number;
  buyPriceSupplier: number;
};

type OrderLineInput = {
  productId: number;
  productName: string | null;
  buyPriceSupplier: number;
  quantity: number;
};

type OrderWithLines = {
  lines: OrderLineInput[];
};

const buildConsolidatedLines = (
  orders: OrderWithLines[],
): ConsolidatedLine[] => {
  const merged = new Map<number, ConsolidatedLine>();
  orders.forEach((order) => {
    order.lines.forEach((line) => {
      const existing = merged.get(line.productId);
      if (existing) {
        existing.quantity += line.quantity;
        return;
      }
      merged.set(line.productId, {
        productId: line.productId,
        productName: line.productName ?? "Producto",
        quantity: line.quantity,
        buyPriceSupplier: line.buyPriceSupplier,
      });
    });
  });
  return Array.from(merged.values());
};

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const purchaseOrderId = Number(id);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const {
    data: purchaseOrder,
    isPending,
    error,
  } = useQuery({
    queryKey: ["purchase-order", purchaseOrderId],
    queryFn: () => getPurchaseOrder(purchaseOrderId),
    enabled: Number.isFinite(purchaseOrderId),
  });

  const {
    data: ordersData,
    isPending: ordersPending,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: isEditing,
  });

  const updateMutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      toast.success("Orden de compra actualizada");
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", purchaseOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setIsEditing(false);
      navigate("/purchase-order");
    },
    onError: () => {
      toast.error("No se pudo actualizar la orden de compra");
    },
  });

  useEffect(() => {
    if (!purchaseOrder || isEditing) {
      return;
    }
    setSelectedOrderIds(purchaseOrder.orders.map((order) => order.orderId));
  }, [isEditing, purchaseOrder]);

  const consolidated = useMemo<ConsolidatedLine[]>(() => {
    if (!purchaseOrder) {
      return [];
    }

    return buildConsolidatedLines(purchaseOrder.orders);
  }, [purchaseOrder]);

  const selectedOrders = useMemo<OrderListItem[]>(() => {
    if (!ordersData) {
      return [];
    }
    return ordersData.orders.filter((order) =>
      selectedOrderIds.includes(order.orderId),
    );
  }, [ordersData, selectedOrderIds]);

  const editConsolidated = useMemo<ConsolidatedLine[]>(
    () => buildConsolidatedLines(selectedOrders),
    [selectedOrders],
  );

  const consolidatedTotal = useMemo(
    () =>
      consolidated.reduce(
        (sum, line) => sum + line.buyPriceSupplier * line.quantity,
        0,
      ),
    [consolidated],
  );

  const editConsolidatedTotal = useMemo(
    () =>
      editConsolidated.reduce(
        (sum, line) => sum + line.buyPriceSupplier * line.quantity,
        0,
      ),
    [editConsolidated],
  );

  const handleStartEdit = () => {
    if (!purchaseOrder) {
      return;
    }
    setSelectedOrderIds(purchaseOrder.orders.map((order) => order.orderId));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (purchaseOrder) {
      setSelectedOrderIds(purchaseOrder.orders.map((order) => order.orderId));
    }
  };

  const handleToggleOrder = (order: OrderListItem) => {
    setSelectedOrderIds((prev) => {
      if (prev.includes(order.orderId)) {
        return prev.filter((id) => id !== order.orderId);
      }
      return [...prev, order.orderId];
    });
  };

  const handleSaveChanges = () => {
    if (updateMutation.isPending || selectedOrderIds.length === 0) {
      return;
    }

    updateMutation.mutate({
      id: purchaseOrderId,
      orderListIds: selectedOrderIds,
    });
  };

  if (!Number.isFinite(purchaseOrderId)) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
          <Card className="rounded-3xl border border-border/70 bg-card/90 p-6 text-left">
            <h2 className="text-lg font-semibold text-foreground">
              Orden de compra invalida
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              El identificador no es valido. Vuelve al listado de ordenes de
              compra.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/purchase-order")}
              >
                Volver a ordenes de compra
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        {isPending && <div>Cargando orden de compra...</div>}
        {error && (
          <Card className="rounded-3xl border border-border/70 bg-card/90 p-6 text-left">
            <h2 className="text-lg font-semibold text-foreground">
              No se pudo cargar la orden
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta nuevamente o vuelve al listado.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/purchase-order")}
              >
                Volver a ordenes de compra
              </Button>
            </div>
          </Card>
        )}

        {purchaseOrder && (
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Orden #{purchaseOrder.purchaseOrderId}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(purchaseOrder.createdAt).toLocaleDateString(
                    "es-CL",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={handleStartEdit}>
                  Editar orden de compra
                </Button>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveChanges}
                    disabled={
                      selectedOrderIds.length === 0 || updateMutation.isPending
                    }
                  >
                    {updateMutation.isPending
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <>
                <p className="max-w-2xl text-base text-muted-foreground">
                  Selecciona los pedidos para actualizar la orden de compra.
                </p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderIds.length
                        ? `Pedidos seleccionados: ${selectedOrderIds.length}`
                        : "Selecciona pedidos para continuar."}
                    </p>
                  </div>
                  {ordersPending && <div>Cargando pedidos...</div>}
                  {ordersError && <div>Error cargando pedidos</div>}
                  <div className="grid gap-4">
                    {ordersData?.orders.map((order) => (
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
                        isSelected={selectedOrderIds.includes(order.orderId)}
                        onClick={() => handleToggleOrder(order)}
                      />
                    ))}
                  </div>
                </div>

                <Card className="rounded-3xl border border-border bg-card/90 p-6 text-left">
                  <h2 className="text-lg font-semibold text-foreground">
                    Consolidado de productos
                  </h2>
                  <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-white/80">
                    {editConsolidated.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">
                        No hay productos para consolidar.
                      </p>
                    ) : (
                      editConsolidated.map((line) => (
                        <div
                          key={line.productId}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-foreground">
                              {line.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {line.quantity} x{" "}
                              {formatChileanPeso(line.buyPriceSupplier)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatChileanPeso(
                              line.buyPriceSupplier * line.quantity,
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <span>Total compra</span>
                    <span className="text-base font-semibold text-foreground">
                      {formatChileanPeso(editConsolidatedTotal)}
                    </span>
                  </div>
                </Card>
              </>
            ) : (
              <>
                <Card className="rounded-3xl border border-border bg-card/90 p-6 text-left">
                  <h2 className="text-lg font-semibold text-foreground">
                    Consolidado de productos
                  </h2>
                  <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-white/80">
                    {consolidated.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">
                        No hay productos para consolidar.
                      </p>
                    ) : (
                      consolidated.map((line) => (
                        <div
                          key={line.productId}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-foreground">
                              {line.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {line.quantity} x{" "}
                              {formatChileanPeso(line.buyPriceSupplier)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatChileanPeso(
                              line.buyPriceSupplier * line.quantity,
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <span>Total compra</span>
                    <span className="text-base font-semibold text-foreground">
                      {formatChileanPeso(consolidatedTotal)}
                    </span>
                  </div>
                </Card>

                <Card className="rounded-3xl border border-border/70 bg-card/90 p-6 text-left">
                  <h2 className="text-lg font-semibold text-foreground">
                    Pedidos incluidos
                  </h2>
                  <div className="mt-4 space-y-4">
                    {purchaseOrder.orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay pedidos asociados a esta orden de compra.
                      </p>
                    ) : (
                      purchaseOrder.orders.map((order) => {
                        const orderTotal = order.lines.reduce(
                          (sum, line) =>
                            sum + line.pricePerUnit * line.quantity,
                          0,
                        );
                        return (
                          <div
                            key={order.orderId}
                            className="rounded-2xl border border-border/60 bg-white/80 p-4"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Pedido #{order.orderId}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {order.localName ?? "Cliente"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString(
                                "es-CL",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
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
                                    {formatChileanPeso(
                                      line.pricePerUnit * line.quantity,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm text-muted-foreground">
                              <span>Total pedido</span>
                              <span className="text-base font-semibold text-foreground">
                                {formatChileanPeso(orderTotal)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
