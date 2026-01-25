import API_BASE_URL from "@/config/api";
export type OrderLine = {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
  buyPriceSupplier: number;
};

export type OrderListItem = {
  orderId: number;
  purchaseOrderId: number | null;
  createdAt: string;
  localName: string | null;
  phone: string | null;
  lines: OrderLine[];
};

export type OrdersResponse = {
  orders: OrderListItem[];
};

export const getOrders = async (): Promise<OrdersResponse> => {
  const res = await fetch(`${API_BASE_URL}/orders`);

  if (!res.ok) {
    throw new Error("Error cargando pedidos");
  }
  const data: OrdersResponse = await res.json();

  const ordersList = data.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const ordersResponse: OrdersResponse = {
    orders: ordersList,
  };
  return ordersResponse;
};
