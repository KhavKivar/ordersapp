
export interface OrderPurchaseLineItem {
  buyPriceSupplier: number;
  sellPriceClient: number;
  quantity: number;
  lineTotal: number;
  productName: string;
}

export interface OrderPurchaseListItem {
  purchaseOrderId: number;
  createdAt: string;
  lines: OrderPurchaseLineItem[];
}

export interface PurchaseOrderDetailLine {
  lineId: number;
  productId: number;
  productName: string | null;
  pricePerUnit: number;
  buyPriceSupplier: number;
  quantity: number;
  lineTotal: number | null;
}

export interface PurchaseOrderDetailOrder {
  orderId: number;
  createdAt: string;
  localName: string | null;
  phone: string | null;
  lines: PurchaseOrderDetailLine[];
}

export interface PurchaseOrderDetail {
  purchaseOrderId: number;
  createdAt: string;
  status: "pending" | "received" | "paid" | "cancelled";
  orders: PurchaseOrderDetailOrder[];
}

export interface CreatePurchaseOrderInput {
  orderListIds: number[];
}