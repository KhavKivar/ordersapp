export interface OrderLineItem {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  buyPriceSupplier: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
}

export interface OrderListItem {
  orderId: number;
  createdAt: string;
  clientId: number;
  localName: string | null;
  phone: string | null;
  lines: OrderLineItem[];
  purchaseOrderId: number | null;
}

interface itemInput {
  productId: number;
  pricePerUnit: number;
  quantity: number;
}
export interface CreateOrderInput {
  clientId: number;
  items: itemInput[];
}
