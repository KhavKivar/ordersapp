import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
import FormField from "@/components/ui/Form/form_field";
import Input from "@/components/ui/Input/input";
import { clientSchema, type Client } from "@/features/client/api/client.schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

type FormFields = Client;

export default function NewClientPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-rose-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <p className="max-w-2xl text-base text-slate-600">
            Completa los datos del cliente para usarlo en los pedidos.
          </p>
        </header>
        <Card className="text-left px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <FormField
                label="Nombre completo"
                error={errors.name?.message}
                labelClassName="text-sm font-semibold text-slate-700"
              >
                <Input
                  registration={register("name")}
                  placeholder="Nombre del cliente"
                />
              </FormField>
              <FormField
                label="Nombre local"
                error={errors.localName?.message}
                labelClassName="text-sm font-semibold text-slate-700"
              >
                <Input
                  registration={register("localName")}
                  placeholder="Nombre del local"
                />
              </FormField>

              <FormField
                label="Direccion"
                error={errors.address?.message}
                labelClassName="text-sm font-semibold text-slate-700"
              >
                <Input
                  registration={register("address")}
                  placeholder="Direccion del cliente"
                />
              </FormField>

              <FormField
                label="Telefono"
                error={errors.phone?.message}
                labelClassName="text-sm font-semibold text-slate-700"
              >
                <Input
                  registration={register("phone")}
                  placeholder="56912345678"
                  inputMode="tel"
                  maxLength={20}
                />
              </FormField>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Todos los campos son obligatorios.
              </p>

              <Button variant={"primary"} type="submit">
                Guardar cliente
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
