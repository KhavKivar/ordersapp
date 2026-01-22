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
import API_BASE_URL from "@/config/api";
import type { Client } from "@/features/client/api/client.schema";
import { createOrder } from "@/features/orders/api/create-order";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";
import { formatChileanPeso } from "@/utils/format-currency";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Store, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import z from "zod";

const schema = z.object({
  clientId: z.number("El cliente es obligatorio"),
  item: z
    .string("El producto es obligatorio")
    .nonempty("El producto es obligatorio"),
  quantity: z.string().nonempty("La cantidad debe ser al menos 1"),
  pricePerUnit: z.string().nonempty("El precio es obligatorio"),
});

type FormFields = z.infer<typeof schema>;
type ProductQuery = { products: Product[] };
type ClientQuery = { clients: Client[] };

export default function OrdersPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,

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

  const isLoadingData = isPending || productsPending;
  const isErrorData = error || productsError;
  const isSuccessData = data || productsData;

  const [selectClient, setSelectClient] = useState<Client | null>(null);
  const [isClientOpen, setClientOpen] = useState(false);

  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [isProductOpen, setProductOpen] = useState(false);
  const mutation = useMutation({ mutationFn: createOrder });

  const [order, setOrder] = useState<OrderCreateDto>({
    clientId: 0,
    items: [],
  });

  const orderItems = order.items.map((item) => {
    const product = productsData?.products.find(
      (entry) => entry.id === item.productId,
    );

    return {
      ...item,
      name: product?.name ?? "Producto",
    };
  });

  const orderTotal = order.items.reduce(
    (total, item) => total + item.pricePerUnit * item.quantity,
    0,
  );

  const handleRemoveItem = (productId: number) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.filter((item) => item.productId !== productId),
    }));
  };

  const handleCreateOrder = () => {
    if (order.items.length === 0) {
      return;
    }

    mutation.mutate(order, {
      onSuccess: () => {
        navigate("/orders", { state: { toast: "Pedido agregado" } });
      },
    });
  };

  const onSubmit = handleSubmit(
    (data) => {
      console.log(selectProduct);
      const pricePerUnit = Number(data.pricePerUnit) || 0;
      const quantity = Number(data.quantity) || 0;
      //First check if the product is already in the order
      const productIndex = order.items.findIndex(
        (item) => item.productId === selectProduct?.id,
      );
      console.log(order);
      if (productIndex !== -1) {
        //If the product is already in the order, update the quantity
        const newItems = [...order.items];
        newItems[productIndex].quantity += quantity;
        newItems[productIndex].pricePerUnit = pricePerUnit;
        setOrder({
          ...order,
          items: newItems,
        });
        return;
      }
      setOrder({
        ...order,
        items: [
          ...order.items,
          {
            productId: selectProduct?.id || 0,
            quantity,
            pricePerUnit,
          },
        ],
      });
    },
    (formErrors) => console.log("errors", formErrors),
  );

  // if (productsPending || clientsPending) {
  //   return <div>Cargando...</div>;
  // }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        {isLoadingData && <div>Cargando...</div>}
        {isErrorData && <div>Error al cargar los clientes</div>}
        {isSuccessData && !isLoadingData && !isErrorData && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={onSubmit}>
              <div className="space-y-6">
                <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm">
                  <Dialog open={isClientOpen} onOpenChange={setClientOpen}>
                    <DialogTrigger asChild>
                      <button className="text-left w-full">
                        <FormField
                          label="Cliente"
                          error={errors.clientId?.message}
                          labelClassName="text-sm font-semibold text-slate-700"
                        >
                          <Input
                            value={selectClient?.name ?? ""}
                            registration={{}}
                            className=""
                            placeholder="Nombre del cliente"
                            readOnly
                          />
                        </FormField>
                      </button>
                    </DialogTrigger>
                    <input
                      type="hidden"
                      {...register("clientId", { valueAsNumber: true })}
                    />
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
                                  value={`${client.localName} ${client.name}`}
                                  onSelect={() => {
                                    setSelectClient(client);
                                    setValue("clientId", Number(client.id), {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                    setOrder((prevOrder) => ({
                                      ...prevOrder,
                                      clientId: Number(client.id),
                                    }));
                                    setClientOpen(false);
                                  }}
                                  className="min-h-11 px-4 py-3"
                                >
                                  <div className="flex flex-col">
                                    <div className="flex gap-2">
                                      <Store />
                                      {client.localName}
                                    </div>
                                    <div className="flex gap-2">
                                      <User />
                                      {client.name}
                                    </div>
                                  </div>
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
                </div>

                <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg">
                  <div className="grid gap-4 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.4fr]">
                    <Dialog open={isProductOpen} onOpenChange={setProductOpen}>
                      <DialogTrigger asChild>
                        <div className="space-y-2">
                          <FormField
                            label="Producto"
                            error={errors.item?.message}
                            labelClassName="text-sm font-semibold text-slate-700"
                          >
                            <Input
                              value={selectProduct?.name ?? ""}
                              registration={{}}
                              placeholder="Producto"
                              readOnly
                            />
                          </FormField>
                        </div>
                      </DialogTrigger>
                      <input type="hidden" {...register("item")} />
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

                                        setValue("item", product.name, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        });
                                        setValue(
                                          "pricePerUnit",
                                          String(product.sellPriceClient),
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        );
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
                      label="Precio"
                      error={errors.pricePerUnit?.message}
                      labelClassName="text-sm font-semibold text-slate-700"
                    >
                      <Input
                        registration={register("pricePerUnit")}
                        placeholder="Precio"
                      />
                    </FormField>
                    <FormField
                      label="Cantidad"
                      error={errors.quantity?.message}
                      labelClassName="text-sm font-semibold text-slate-700"
                    >
                      <Input
                        registration={register("quantity")}
                        placeholder="Cantidad"
                      />
                    </FormField>

                    <div className="flex items-end">
                      <Button type="submit" variant={"primary"}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground">
                  Resumen del pedido
                </h2>
                <div className="mt-4 space-y-4">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aun no hay productos agregados.
                    </p>
                  ) : (
                    orderItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.quantity}`}
                        className="space-y-1 rounded-2xl border border-border/60 bg-white/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatChileanPeso(item.pricePerUnit)} x
                              {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatChileanPeso(
                              item.pricePerUnit * item.quantity,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="min-h-11 rounded-full border border-rose-200 px-4 text-xs font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                  <span>Total</span>
                  <span className="text-base font-semibold text-foreground">
                    {formatChileanPeso(orderTotal)}
                  </span>
                </div>
                <Spacer size={5}></Spacer>
                <Button
                  onClick={handleCreateOrder}
                  variant={"primary"}
                  disabled={mutation.isPending}
                >
                  Crear pedido
                </Button>
              </div>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
