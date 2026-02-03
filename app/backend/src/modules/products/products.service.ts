import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { products } from "../../db/schema.js";
import { CreateProductDto, Product } from "./products.schema.js";

export class ProductService {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const [createdProduct] = await this.db
      .insert(products)
      .values(createProductDto)
      .returning();

    return createdProduct;
  }

  async listProducts(): Promise<Product[]> {
    return this.db.select().from(products);
  }
  async getProductById(id: number): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product ?? null;
  }
}
