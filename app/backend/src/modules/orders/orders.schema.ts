import { createSelectSchema } from "drizzle-zod";
import z from "zod/v4";
import { orders } from "../../db/schema.js";

export const orderLineItemSchema = z.object({
  lineId: z.number(),
  productId: z.number(),
  pricePerUnit: z.number(),
  quantity: z.number(),
  lineTotal: z.number(),
  productName: z.string().nullable(),
  buyPriceSupplier: z.number(),
});

const orderStatusEnum = z.enum([
  "pending",
  "paid",
  "delivered",
  "delivered_paid",
  "cancelled",
]);

const orderListItemSchema = z.object({
  orderId: z.number(),
  createdAt: z.string(),
  clientId: z.number(),
  localName: z.string().nullable(),
  phone: z.string().nullable(),
  lines: z.array(orderLineItemSchema),
  purchaseOrderId: z.number().nullable(),
  status: orderStatusEnum,
});

export const orderListItemArraySchema = z.array(orderListItemSchema);

const order = createSelectSchema(orders);
export type Order = z.infer<typeof order>;
export type OrderListItem = z.infer<typeof orderListItemSchema>;
export type OrderLineItem = z.infer<typeof orderLineItemSchema>;

export type CreateOrderInput = z.infer<typeof orderCreateDto.body>;
export type OrderGetByIdInput = z.infer<typeof orderGetByIdDto.params>;
export type OrderGetAvailableInput = z.infer<
  typeof orderGetAvailableDto.params
>;
export type OrderUpdateInput = z.infer<typeof orderUpdateDto.body>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateDto.body>;
export type OrderDeleteInput = z.infer<typeof orderDeleteDto.params>;

export const orderGetByIdDto = {
  params: z.object({
    id: z.coerce.number().positive("Order ID must be a positive number"),
  }),
  response: {
    200: z.object({
      order: orderListItemSchema,
    }),
  },
};

export const orderGetAvailableDto = {
  params: z.object({
    purchaseOrderId: z.coerce
      .number()
      .positive("Purchase Order ID must be a positive number"),
  }),
  response: {
    200: z.object({
      orders: orderListItemArraySchema,
    }),
  },
};

export const orderCreateDto = {
  body: z.object({
    clientId: z.number().positive("Client ID must be a positive number"),
    items: z.array(
      z.object({
        productId: z.number().positive("Product ID must be a positive number"),
        pricePerUnit: z
          .number()
          .positive("Price per unit must be a positive number"),
        quantity: z.number().positive("Quantity must be a positive number"),
      }),
    ),
  }),
  response: {
    201: z.object({
      order: order,
    }),
  },
};

export const orderUpdateDto = {
  body: z.object({
    orderId: z.number().positive("Order ID must be a positive number"),
    order: orderCreateDto.body,
  }),
};

export const orderStatusUpdateDto = {
  body: z.object({
    orderId: z.number().positive("Order ID must be a positive number"),
    status: orderStatusEnum,
  }),
  response: {
    200: z.object({
      order: order,
    }),
  },
};

export const orderDeleteDto = {
  params: z.object({
    id: z.coerce.number().positive("Order ID must be a positive number"),
  }),
  response: {
    200: z.object({
      order: order,
    }),
  },
};

// const clientSchema = createSelectSchema(clients);

// export type Client = z.infer<typeof clientSchema>;
// export type CreateClientInput = z.infer<typeof clientCreateDto.body>;
// export type UpdateClientInput = z.infer<typeof clientUpdateDto.body>;

// export const clientByPhoneDto = {
//   params: z.object({
//     phone: z.string().regex(phoneRegex, {
//       message:
//         "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
//     }),
//   }),
//   response: {
//     200: z.object({
//       client: clientSchema,
//     }),
//   },
// };

// export const clientByPhoneIdDto = {
//   params: z.object({
//     phoneId: z.string().min(10, "PhoneId must be at least 10 characters long"),
//   }),
//   response: {
//     200: z.object({
//       client: clientSchema,
//     }),
//     404: z.object({
//       statusCode: z.number(),
//       error: z.string(),
//       message: z.string(),
//     }),
//   },
// };

// export const clientCreateDto = {
//   body: z.object({
//     localName: z
//       .string()
//       .min(4, "Local name must be at least 4 characters long"),
//     address: z.string(),
//     phone: z.string().regex(phoneRegex, {
//       message:
//         "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
//     }),
//     phoneId: z.string().nullable(),
//   }),
//   response: {
//     201: z.object({
//       client: clientSchema,
//     }),
//   },
// };

// export const clientUpdateDto = {
//   body: z.object({
//     localName: z
//       .string()
//       .min(4, "Local name must be at least 4 characters long")
//       .optional(),
//     address: z.string().optional(),
//     phone: z
//       .string()
//       .regex(phoneRegex, {
//         message:
//           "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
//       })
//       .optional(),
//     phoneId: z.string().optional().nullable(),
//   }),
//   response: {
//     200: z.object({
//       client: clientSchema,
//     }),
//   },
// };
