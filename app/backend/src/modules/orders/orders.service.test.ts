import { sql } from "drizzle-orm";
import Fastify from "fastify";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientService } from "../clients/clients.service.js";

import { ProductService } from "../products/products.service.js";
import { OrderService } from "./orders.service.js";

describe("Orders Service", () => {
  let app: Fastify.FastifyInstance;
  let orderService: OrderService;
  let clientService: ClientService;
  let productService: ProductService;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
    orderService = new OrderService(app.db);
    productService = new ProductService(app.db);
    clientService = new ClientService(app.db);
  });
  beforeEach(async () => {
    // Clean everything
    await app.db.execute(sql`TRUNCATE TABLE orders RESTART IDENTITY CASCADE;`);
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
    await app.db.execute(
      sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`,
    );

    // Recreate dependencies fresh for this test
    await productService.createProduct({
      name: "Product 1",
      buyPriceSupplier: 1,
      type: "product",
      sellPriceClient: 1,
      sizeMl: null,
      description: null,
      batchSize: 0,
    });

    await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
  });

  it("should create a orders", async () => {
    const order = await orderService.createOrder({
      clientId: 1,
      items: [{ productId: 1, pricePerUnit: 1, quantity: 1 }],
    });
    console.log(order);
    expect(order).not.toBeNull();
  });
  it("should throw a error when the client not exists", async () => {
    expect(() =>
      orderService.createOrder({
        clientId: 2,
        items: [{ productId: 1, pricePerUnit: 1, quantity: 1 }],
      }),
    ).rejects.toThrow("CLIENT_NOT_FOUND");
  });
});
