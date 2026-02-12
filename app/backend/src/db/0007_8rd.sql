UPDATE "products"
SET "sell_price_client" = 6500,
    "buy_price_supplier" = 6000
WHERE "id" = 20;

-- Aguardiente Blanco del Valle (ID 37)
UPDATE "products"
SET "sell_price_client" = 8000,
    "buy_price_supplier" = 7500
WHERE "id" = 37;

-- 2. INSERTAR NUEVOS (Sin ID fijo para evitar errores)
-- Nota: He quitado la columna "id" para que la base de datos ponga el número libre que toque.

INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES
  -- Baileys Original 1 Lt
  ('Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, 12),

  -- Licor Sheridans 1 Lt (Corregido nombre)
  ('Licor Sheridans 1 Lt', 'licor', 1000, 22900, 22000, 12);