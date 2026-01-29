import Fastify from "fastify";
import { beforeAll, describe, expect, it } from "vitest";
import { listProducts } from "./products.service.js";

describe("Product Service", () => {
  let app: Fastify.FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
  });

  it("should list all products", async () => {
    const products = await listProducts(app.db);
    expect(products).toBeInstanceOf(Array);
  });
});
