import Fastify from "fastify";
import { beforeAll, describe, expect, it } from "vitest";
import { productsRoutes } from "./index.js";

describe("Product Routes", () => {
  let app: Fastify.FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db);
    app.register(productsRoutes);
  });

  it("GET /products should return a list of products", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/products",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.products).toBeInstanceOf(Array);
  });
});
