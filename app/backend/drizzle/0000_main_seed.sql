CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"localName" varchar(255),
	"address" varchar(512),
	"phone" varchar(20),
	"phone_id" varchar(64) NOT NULL,
	CONSTRAINT "clients_phone_unique" UNIQUE("phone"),
	CONSTRAINT "clients_phone_id_unique" UNIQUE("phone_id")
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_lines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"price_per_unit" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" integer GENERATED ALWAYS AS ("price_per_unit" * "quantity") STORED
);
--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled');
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"type" varchar(64) NOT NULL,
	"size_ml" integer,
	"sell_price_client" integer NOT NULL,
	"buy_price_supplier" integer NOT NULL,
	"description" varchar(1024)
);
--> statement-breakpoint
INSERT INTO "products" ("id", "name", "type", "size_ml", "sell_price_client", "buy_price_supplier") 
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Whisky Jack Daniel N°7 Lt con dosificador', 'whisky', 1000, 15500, 15000),
  (2, 'Whisky Jack Daniel Manzana Lt con dosificador', 'whisky', 1000, 16000, 15500),
  (3, 'Whisky Jack Daniel Honey Lt', 'whisky', 1000, 15500, 15000),
  (4, 'Whisky Jack Daniel Fire Lt', 'whisky', 1000, 15500, 15000),
  (5, 'Whisky Black Label Lt', 'whisky', 1000, 23000, 22500),
  (6, 'Whisky Red Label Lt', 'whisky', 1000, 10000, 9500),
  (7, 'Ballantine Finest Lt', 'whisky', 1000, 8590, 8090),
  (8, 'Chivas Regal 12 años Lt', 'whisky', 1000, 16900, 16400),
  (9, 'Whisky Old Par Lt', 'whisky', 1000, 23000, 22500),
  (10, 'Whisky Royal Circle Lt', 'whisky', 1000, 4900, 4400),
  (11, 'Whisky Royal Circle Honey Lt', 'whisky', 1000, 5500, 5000),
  (12, 'Whisky Royal Circle 200ml x48 un Black', 'whisky', 200, 990, 490),
  (13, 'Royal Circle Whisky & Cola 330ml x24', 'whisky', 330, 990, 490),
  (14, 'Ron Havana Club añejo Especial Lt', 'ron', 1000, 6590, 6090),
  (15, 'Havana Club Reserva Lt', 'ron', 1000, 8590, 8090),
  (16, 'Havana Club 7 años', 'ron', null, 9590, 9090),
  (17, 'Havana Club 3 años Lt', 'ron', 1000, 6590, 6090),
  (18, 'Havana Especial 750ml', 'ron', 750, 5500, 5000),
  (19, 'Havana Reserva 750ml', 'ron', 750, 6500, 6000),
  (20, 'Ron Abuelo añejo Lt', 'ron', 1000, 6000, 5500),
  (21, 'Ron Viejo Caldas 3 años', 'ron', null, 5900, 5400),
  (22, 'Ron Viejo Caldas 5 años', 'ron', null, 6900, 6400),
  (23, 'Ron Viejo Caldas 8 años', 'ron', null, 12500, 12000),
  (24, 'Malibu de coco 750ml', 'ron', 750, 8900, 8400),
  (25, 'Flor de Caña 4 años Lt', 'ron', 1000, 7900, 7400),
  (26, 'Flor de Caña 7 años Lt', 'ron', 1000, 10500, 10000),
  (27, 'Ron Barcelo añejo Lt', 'ron', 1000, 6000, 5500),
  (28, 'Ron Barcelo blanco Lt', 'ron', 1000, 4500, 4000),
  (29, 'Ron con Café Ojos de tigre 180ml x24', 'ron', 180, 990, 490),
  (30, 'Licor Ramazzotti Rosato 700ml', 'licor', 700, 9500, 9000),
  (31, 'Licor Ramazzotti Violet 700ml', 'licor', 700, 9500, 9000),
  (32, 'Licor Amarula 750ml', 'licor', 750, 9500, 9000),
  (33, 'Gin Beefeater Clásico blanco 750ml', 'gin', 750, 9500, 9000),
  (34, 'Gin Beefeater Pink 750ml', 'gin', 750, 11500, 11000),
  (35, 'Licor Jagermeister Lt 35°Alc', 'licor', 1000, 10690, 10190),
  (36, 'Aguardiente Antiqueño 750ml', 'aguardiente', 750, 7900, 7400),
  (37, 'Aguardiente Blanco del Valle Lt', 'aguardiente', 1000, 8000, 7500),
  (38, 'Tequila Dona camila c/g Lt', 'tequila', 1000, 6500, 6000),
  (39, 'Tequila Dona camila s/g Lt', 'tequila', 1000, 6500, 6000),
  (40, 'Tequila Olmeca blanco 700ml', 'tequila', 700, 9500, 9000),
  (41, 'Tequila Olmeca Reposado 700ml', 'tequila', 700, 9500, 9000),
  (42, 'Tequila Chocolate 700ml', 'tequila', 700, 9900, 9400),
  (43, 'Tequila José Cuervo 750ml', 'tequila', 750, 11000, 10500),
  (44, 'Vodka Absolut Clásico 1 lt', 'vodka', 1000, 11000, 10500);
--> statement-breakpoint


INSERT INTO "clients" ("name", "localName", "address", "phone", "phone_id")
VALUES ('Cliente Demo', 'Tienda Demo', 'Direccion Demo 123', '56970000000', '56970000000@lid');
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
