import { pgTable, unique, integer, varchar, foreignKey, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("order_status", ['pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'])
export const purchaseOrderStatus = pgEnum("purchase_order_status", ['pending', 'received', 'paid', 'cancelled'])


export const clients = pgTable("clients", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "clients_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	localName: varchar({ length: 255 }),
	address: varchar({ length: 512 }),
	phone: varchar({ length: 20 }),
	phoneId: varchar("phone_id", { length: 64 }),
}, (table) => [
	unique("clients_phone_unique").on(table.phone),
	unique("clients_phone_id_unique").on(table.phoneId),
]);

export const orders = pgTable("orders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	clientId: integer("client_id").notNull(),
	purchaseOrderId: integer("purchase_order_id"),
	status: orderStatus().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "orders_client_id_fkey"
		}),
	foreignKey({
			columns: [table.purchaseOrderId],
			foreignColumns: [purchaseOrders.id],
			name: "orders_purchase_order_id_fkey"
		}).onDelete("set null"),
]);

export const purchaseOrders = pgTable("purchase_orders", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "purchase_orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	status: purchaseOrderStatus().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const orderLines = pgTable("order_lines", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "order_lines_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id").notNull(),
	pricePerUnit: integer("price_per_unit").notNull(),
	quantity: integer().notNull(),
	lineTotal: integer("line_total").generatedAlwaysAs(sql`(price_per_unit * quantity)`),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_lines_order_id_fkey"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_lines_product_id_fkey"
		}),
]);

export const products = pgTable("products", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "products_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 64 }).notNull(),
	sizeMl: integer("size_ml"),
	sellPriceClient: integer("sell_price_client").notNull(),
	buyPriceSupplier: integer("buy_price_supplier").notNull(),
	description: varchar({ length: 1024 }),
	batchSize: integer("batch_size").default(1).notNull(),
});
