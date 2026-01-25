import API_BASE_URL from "@/config/api";

export type OrderDetailLine = {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
  buyPriceSupplier: number;
};

export type OrderDetail = {
  orderId: number;
  purchaseOrderId: number | null;
  createdAt: string;
  clientId: number;
  clientName: string | null;
  localName: string | null;
  phone: string | null;
  lines: OrderDetailLine[];
};

export const getOrder = async (orderId: number): Promise<OrderDetail> => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);

  if (!res.ok) {
    throw new Error("Error cargando pedido");
  }

  const data: { order: OrderDetail } = await res.json();

  return data.order;
};
