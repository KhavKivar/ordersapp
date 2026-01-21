import { BackButton } from "@/components/ui/BackButton/backButton";
import { Button } from "@/components/ui/Button/button";
import FormField from "@/components/ui/Form/form_field";
import Input from "@/components/ui/Input/input";
import { Spacer } from "@/components/ui/Spacer/spacer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const schema = z.object({
  clientId: z.number(),
  items: z.array(
    z.object({
      productId: z.number(),
      pricePerUnit: z.number(),
      quantity: z.number(),
    }),
  ),
  quantity: z.number(),
});

type FormFields = z.infer<typeof schema>;

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
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(API_BASE_URL + "/products").then((res) => res.json()),
  });

  const {
    isPending: clientsPending,
    error: clientsError,
    data: clientsData,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetch(API_BASE_URL + "/clients").then((res) => res.json()),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  if (productsPending || clientsPending) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <BackButton className="text-accent-strong" label="Volver" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-foreground">
            Crear pedido
          </p>
          <h1 className="text-4xl font-semibold text-foreground">
            Nuevo pedido manual
          </h1>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg">
              <FormField
                label="Cliente"
                error={errors.clientId?.message}
                labelClassName="text-sm font-semibold text-slate-700"
              >
                <Input
                  registration={register("clientId")}
                  placeholder="Nombre del cliente"
                />
              </FormField>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.6fr_0.4fr]">
                <div className="space-y-2">
                  <FormField
                    label="Producto"
                    error={errors.clientId?.message}
                    labelClassName="text-sm font-semibold text-slate-700"
                  >
                    <Input
                      registration={register("items")}
                      placeholder="Producto"
                    />
                  </FormField>
                </div>
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
                  <Button variant={"primary"}>Agregar</Button>
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
              <Button onClick={onSubmit} variant={"primary"}>
                Crear pedido
              </Button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
