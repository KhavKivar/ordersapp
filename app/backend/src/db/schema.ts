import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { SQL, sql } from "drizzle-orm/sql/sql";

export const productsTable = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 64 }).notNull(),
  size_ml: integer(),
  sell_price_client: integer().notNull(),
  buy_price_supplier: integer().notNull(),
  description: varchar({ length: 1024 }),
});

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "delivered",
  "delivered_paid",
  "cancelled",
]);

export const ordersTable = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  client_id: integer().notNull(),
  status: orderStatusEnum().default("pending").notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

export const orderLinesTable = pgTable("order_lines", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  order_id: integer().notNull(),
  product_id: integer().notNull(),
  price_per_unit: integer().notNull(),
  quantity: integer().notNull(),
  line_total: integer().generatedAlwaysAs(
    (): SQL =>
      sql`${orderLinesTable.price_per_unit} * ${orderLinesTable.quantity}`
  ),
});

export const clientTable = pgTable("clients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  localName: varchar({ length: 255 }),
  address: varchar({ length: 512 }),
  phone: varchar({ length: 20 }).unique(),
  phone_id: varchar({ length: 64 }).unique().notNull(),
});
