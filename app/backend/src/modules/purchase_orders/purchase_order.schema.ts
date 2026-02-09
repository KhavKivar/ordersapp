import { createSelectSchema } from "drizzle-zod";
import z from "zod/v4";
import { purchaseOrders } from "../../db/schema.js";

export const purchaseOrderLineItemSchema = z.object({
  buyPriceSupplier: z.number(),
  sellPriceClient: z.number(),
  quantity: z.number(),
  lineTotal: z.number(),
  productName: z.string(),
});

export const purchaseOrderListItemSchema = z.object({
  purchaseOrderId: z.number(),
  createdAt: z.string(),
  lines: z.array(purchaseOrderLineItemSchema),
});

export const purchaseOrderDetailLineSchema = z.object({
  lineId: z.number(),
  productId: z.number(),
  productName: z.string().nullable(),
  pricePerUnit: z.number(),
  buyPriceSupplier: z.number(),
  quantity: z.number(),
  lineTotal: z.number().nullable(),
});

export const purchaseOrderDetailOrderSchema = z.object({
  orderId: z.number(),
  createdAt: z.string(),
  localName: z.string().nullable(),
  phone: z.string().nullable(),
  lines: z.array(purchaseOrderDetailLineSchema),
});

export const purchaseOrderDetailSchema = z.object({
  purchaseOrderId: z.number(),
  createdAt: z.string(),
  status: z.enum(["pending", "received", "paid", "cancelled"]),
  orders: z.array(purchaseOrderDetailOrderSchema),
});

export const purchaseOrderCreateDto = {
  body: z.object({
    orderListIds: z.array(z.number()),
  }),
};

export const purchaseOrderGetByIdDto = {
  params: z.object({
    id: z.coerce
      .number()
      .positive("Purchase Order ID must be a positive number"),
  }),
};

export const purchaseOrderDeleteDto = {
  params: z.object({
    id: z.coerce
      .number()
      .positive("Purchase Order ID must be a positive number"),
  }),
};

const purchaseOrder = createSelectSchema(purchaseOrders);

export type PurchaseOrder = z.infer<typeof purchaseOrder>;
export type OrderPurchaseLineItem = z.infer<typeof purchaseOrderLineItemSchema>;
export type OrderPurchaseListItem = z.infer<typeof purchaseOrderListItemSchema>;
export type PurchaseOrderDetailLine = z.infer<
  typeof purchaseOrderDetailLineSchema
>;
export type PurchaseOrderDetailOrder = z.infer<
  typeof purchaseOrderDetailOrderSchema
>;
export type PurchaseOrderDetail = z.infer<typeof purchaseOrderDetailSchema>;
export type CreatePurchaseOrderInput = z.infer<
  typeof purchaseOrderCreateDto.body
>;
export type PurchaseOrderGetByIdInput = z.infer<
  typeof purchaseOrderGetByIdDto.params
>;
export type PurchaseOrderDeleteInput = z.infer<
  typeof purchaseOrderDeleteDto.params
>;
