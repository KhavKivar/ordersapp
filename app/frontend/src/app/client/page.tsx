import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
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
import { Input } from "@/components/ui/input";
import type { Client } from "@/features/client/api/client.schema";
import { deleteClient } from "@/features/client/api/delete-client";
import { getClients } from "@/features/client/api/get-clients";
import {
  updateClient,
  UpdateClientDtoSchema,
  type UpdateClientDto,
} from "@/features/client/api/update-client";

export default function ClientsAllPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["clients", "all"],
    queryFn: getClients,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateClientDto>({
    resolver: zodResolver(UpdateClientDtoSchema),
    defaultValues: {
      localName: "",
      address: "",
      phone: "",
      phoneId: "",
    },
  });

  useEffect(() => {
    if (!editingClient) {
      return;
    }

    reset({
      localName: editingClient.localName ?? "",
      address: editingClient.address ?? "",
      phone: editingClient.phone ?? "",
      phoneId: editingClient.phoneId ?? "",
    });
  }, [editingClient, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number | string; data: UpdateClientDto }) =>
      updateClient(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Cliente actualizado");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditOpen(false);
      setEditingClient(null);
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo actualizar el cliente.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Cliente eliminado");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el cliente.";
      toast.error(message);
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditOpen(true);
  };

  const handleDelete = (client: Client) => {
    if (deleteMutation.isPending) {
      return;
    }
    console.log(client.id);

    deleteMutation.mutate(client.id);
  };

  const onSubmit: SubmitHandler<UpdateClientDto> = (formData) => {
    if (!editingClient) {
      return;
    }

    const payload: UpdateClientDto = {
      ...formData,
      phoneId: formData.phone,
    };

    updateMutation.mutate({ id: editingClient.id, data: payload });
  };

  const clients = data?.clients ?? [];
  const hasClients = clients.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 sm:pt-12">
        {/* HEADER: Adaptable de móvil a desktop */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="primary"
            onClick={() => navigate("/client/new")}
            className="h-12 w-full rounded-2xl shadow-md shadow-emerald-100 sm:h-10 sm:w-auto sm:px-6"
          >
            <Plus className="mr-2 size-5 sm:size-4" />
            Nuevo cliente
          </Button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <section className="grid gap-4">
          {isPending && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <p className="mt-2 font-medium">Cargando clientes...</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center text-rose-600">
              <p className="font-semibold">
                Ocurrió un error al cargar los datos.
              </p>
            </div>
          )}

          {/* ESTADO VACÍO */}
          {!isPending && !error && !hasClients && (
            <Card className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-transparent p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Store className="size-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Sin clientes aún
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Agrega tu primer local comercial para empezar.
              </p>
            </Card>
          )}

          {/* LISTADO DE TARJETAS */}
          {clients.map((client) => (
            <Card
              key={client.id}
              className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 transition-all active:scale-[0.98] sm:p-6 sm:hover:border-emerald-200 sm:hover:shadow-lg"
            >
              <div className="flex flex-col gap-5">
                {/* Top: Nombre y Acciones */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <Store className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Local Comercial
                      </span>
                      <h3 className="text-lg font-bold leading-tight text-slate-900 text-left">
                        {client.localName || "Cliente"}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-slate-400 hover:bg-slate-100 sm:h-9 sm:w-9"
                      onClick={() => handleEdit(client)}
                    >
                      <PencilLine className="size-5 sm:size-4" />
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full text-rose-400 hover:bg-rose-50 hover:text-rose-600 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="size-5 sm:size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[90vw] max-w-md rounded-[2rem]">
                        <DialogHeader>
                          <DialogTitle>¿Eliminar cliente?</DialogTitle>
                          <DialogDescription>
                            Se borrarán todos los datos de{" "}
                            <strong>{client.localName}</strong>. Esta acción es
                            irreversible.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              className="w-full rounded-xl sm:w-auto"
                            >
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            className="w-full rounded-xl sm:w-auto"
                            onClick={() => handleDelete(client)}
                          >
                            Eliminar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Info: Teléfono y Dirección */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground text-left">
                        Teléfono
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {client.phone || "No registrado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground text-left">
                        Dirección
                      </p>
                      <p className="truncate text-sm font-medium text-slate-600">
                        {client.address || "No registrada"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>

      {/* DIALOG DE EDICIÓN - Optimizado para móvil */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingClient(null);
        }}
      >
        <DialogContent className="fixed bottom-0 top-auto flex max-h-[90vh] w-full max-w-none flex-col rounded-t-[2rem] p-0 sm:relative sm:bottom-auto sm:max-w-lg sm:rounded-[2rem]">
          <DialogHeader className="px-6 pt-6 text-left">
            <DialogTitle className="text-xl font-bold">
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Modifica los datos del local seleccionado.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col p-6 pt-2"
          >
            <div className="space-y-4 pb-6">
              <FormField
                label="Nombre del Local"
                error={errors.localName?.message}
              >
                <Input {...register("localName")} className="h-12 rounded-xl" />
              </FormField>
              <FormField label="Dirección" error={errors.address?.message}>
                <Input {...register("address")} className="h-12 rounded-xl" />
              </FormField>
              <FormField label="Teléfono" error={errors.phone?.message}>
                <Input
                  {...register("phone")}
                  inputMode="tel"
                  className="h-12 rounded-xl"
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl sm:h-10"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="primary"
                className="h-12 rounded-xl sm:h-10"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
