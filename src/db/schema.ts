import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
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

export const ordersTable = pgTable("orders", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    product_id: integer().notNull(),
    client_id: integer().notNull(),
    price_per_unit: integer().notNull(),
    quantity: integer().notNull(),
    total_price: integer().generatedAlwaysAs(
       (): SQL => sql`${ordersTable.price_per_unit} * ${ordersTable.quantity}`
    ),
  });

export const clientTable = pgTable("clients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  localName: varchar({ length: 255 }), 
  address: varchar({ length: 512 }),
  phone: varchar({ length: 20 }).unique()
});
