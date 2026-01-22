import { BackButton } from "@/components/ui/BackButton/backButton";
import { Button } from "@/components/ui/Button/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/Form/form_field";

import Input from "@/components/ui/Input/input";

import { Spacer } from "@/components/ui/Spacer/spacer";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const schema = z.object({
  clientId: z.number("El cliente es obligatorio"),
  items: z
    .array(
      z.object({
        productId: z.number(),
        pricePerUnit: z.number(),
        quantity: z.number(),
      }),
      "Debe agregar al menos un producto",
    )
    .min(1, "Debe agregar al menos un producto"), // Custom message for array length
  quantity: z
    .number("La cantidad debe ser al menos 1")
    .min(1, "La cantidad debe ser al menos 1"),
});

const clientSchema = z.object({
  id: z.number(),
  name: z.string(),
  localName: z.string(),
  address: z.string(),
  phone: z.string(),
  phoneId: z.string(),
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  size_ml: z.number(),
  sell_price_client: z.number(),
  buy_price_supplier: z.number(),
  description: z.string(),
});

type FormFields = z.infer<typeof schema>;

type Product = z.infer<typeof productSchema>;
type ProductQuery = { products: Product[] };
type Client = z.infer<typeof clientSchema>;
type ClientQuery = { clients: Client[] };

export default function OrdersPage() {
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const {
    isPending: productsPending,
    error: productsError,
    data: productsData,
  } = useQuery<ProductQuery>({
    queryKey: ["products"],
    queryFn: () => fetch(API_BASE_URL + "/products").then((res) => res.json()),
  });

  const { isPending, error, data } = useQuery<ClientQuery>({
    queryKey: ["clients"],
    queryFn: () => fetch(API_BASE_URL + "/clients").then((res) => res.json()),
  });

  const [selectClient, setSelectClient] = useState<Client | null>(null);
  const [isClientOpen, setClientOpen] = useState(false);

  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [isProductOpen, setProductOpen] = useState(false);

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });
  console.log(data);

  // if (productsPending || clientsPending) {
  //   return <div>Cargando...</div>;
  // }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <BackButton className="text-foreground" label="Volver" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-foreground">
            Crear pedido
          </p>
          <h1 className="text-4xl font-semibold text-foreground">
            Nuevo pedido manual
          </h1>
        </header>
        {isPending && <div>Cargando...</div>}
        {error && <div>Error al cargar los clientes</div>}
        {data && !isPending && !error && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg">
                <Dialog open={isClientOpen} onOpenChange={setClientOpen}>
                  <DialogTrigger asChild>
                    <button className="text-left w-full">
                      <FormField
                        label="Cliente"
                        error={errors.clientId?.message}
                        labelClassName="text-sm font-semibold text-slate-700"
                      >
                        <Input
                          value={selectClient?.name}
                          registration={register("clientId")}
                          placeholder="Nombre del cliente"
                        />
                      </FormField>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex h-[100svh] w-full max-w-none flex-col p-0 sm:h-auto sm:max-w-lg">
                    <DialogHeader className="border-b border-border px-6 py-4">
                      <DialogTitle>Seleccionar cliente</DialogTitle>
                      <DialogDescription>
                        Busca y selecciona el cliente para este pedido.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-1 flex-col gap-4 px-6 py-4">
                      <Command className="w-full">
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList className="max-h-[60svh] overflow-auto">
                          <CommandEmpty>No hay resultados.</CommandEmpty>
                          <CommandGroup>
                            {data.clients.map((client: Client) => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  setSelectClient(client);
                                  setClientOpen(false);
                                }}
                                className="min-h-11 px-4 py-3"
                              >
                                {client.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                    <DialogFooter className="border-t border-border px-6 py-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.6fr_0.4fr]">
                  <Dialog open={isProductOpen} onOpenChange={setProductOpen}>
                    <DialogTrigger asChild>
                      <div className="space-y-2">
                        <FormField
                          label="Producto"
                          error={errors.clientId?.message}
                          labelClassName="text-sm font-semibold text-slate-700"
                        >
                          <Input
                            value={selectProduct?.name}
                            registration={register("items")}
                            placeholder="Producto"
                          />
                        </FormField>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="flex h-[100svh] w-full max-w-none flex-col p-0 sm:h-auto sm:max-w-lg">
                      <DialogHeader className="border-b border-border px-6 py-4">
                        <DialogTitle>Seleccionar producto</DialogTitle>
                        <DialogDescription>
                          Busca y selecciona el producto para este pedido.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
                        <Command className="w-full">
                          <CommandInput placeholder="Buscar cliente..." />
                          <CommandList className="max-h-[60svh] overflow-auto">
                            <CommandEmpty>No hay resultados.</CommandEmpty>
                            <CommandGroup>
                              {productsData?.products.map(
                                (product: Product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => {
                                      setSelectProduct(product);
                                      setProductOpen(false);
                                    }}
                                    className="min-h-11 px-4 py-3"
                                  >
                                    {product.name}
                                  </CommandItem>
                                ),
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                      <DialogFooter className="border-t border-border px-6 py-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <FormField
                    label="Cantidad"
                    error={errors.quantity?.message}
                    labelClassName="text-sm font-semibold text-slate-700"
                  >
                    <Input
                      registration={register("quantity")}
                      placeholder="Cantidad"
                      min={1}
                      type="number"
                    />
                  </FormField>

                  <div className="flex items-end">
                    <Button onClick={onSubmit} variant={"primary"}>
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground">
                  Resumen del pedido
                </h2>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Aun no hay productos agregados.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                  <span>Total</span>
                  <span className="text-base font-semibold text-foreground">
                    $0
                  </span>
                </div>
                <Spacer size={5}></Spacer>
                <Button variant={"primary"}>Crear pedido</Button>
              </div>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
