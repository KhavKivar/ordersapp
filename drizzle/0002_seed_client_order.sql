INSERT INTO "clients" ("name", "localName", "address", "phone")
VALUES ('Cliente Demo', 'Tienda Demo', 'Direccion Demo 123', '56970000000');
--> statement-breakpoint
INSERT INTO "orders" ("client_id")
VALUES ((SELECT "id" FROM "clients" ORDER BY "id" DESC LIMIT 1));
--> statement-breakpoint
INSERT INTO "order_lines" ("order_id", "product_id", "price_per_unit", "quantity")
VALUES (
  (SELECT "id" FROM "orders" ORDER BY "id" DESC LIMIT 1),
  (SELECT "id" FROM "products" ORDER BY "id" LIMIT 1),
  15500,
  1
);
--> statement-breakpoint
