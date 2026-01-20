import { useState } from "react";

type ClientFormState = {
  name: string;
  localName: string;
  address: string;
  phone: string;
};

type ClientFormErrors = Partial<Record<keyof ClientFormState | "form", string>>;

const initialState: ClientFormState = {
  name: "",
  localName: "",
  address: "",
  phone: "",
};

export default function NewClientPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [formState, setFormState] = useState<ClientFormState>(initialState);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof ClientFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSuccess(null);

    const name = formState.name.trim();
    const localName = formState.localName.trim();
    const address = formState.address.trim();
    const normalizedPhone = formState.phone.trim();
    const nextErrors: ClientFormErrors = {};
    if (!name) {
      nextErrors.name = "El nombre es obligatorio.";
    }
    if (name.length > 255) {
      nextErrors.name = "El nombre no puede superar 255 caracteres.";
    }
    if (!localName) {
      nextErrors.localName = "El nombre local es obligatorio.";
    } else if (localName.length > 255) {
      nextErrors.localName = "El nombre local no puede superar 255 caracteres.";
    }
    if (!address) {
      nextErrors.address = "La direccion es obligatoria.";
    } else if (address.length > 512) {
      nextErrors.address = "La direccion no puede superar 512 caracteres.";
    }
    if (!normalizedPhone) {
      nextErrors.phone = "El telefono es obligatorio.";
    } else if (normalizedPhone.length > 20) {
      nextErrors.phone = "El telefono no puede superar 20 caracteres.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const phoneId = normalizedPhone
      ? normalizedPhone.replace(/\s+/g, "")
      : `manual-${Date.now()}`;
    if (phoneId.length > 64) {
      setErrors({ form: "El phoneId generado es demasiado largo." });
      return;
    }

    const payload = {
      name,
      localName: localName || undefined,
      address: address || undefined,
      phone: normalizedPhone || undefined,
      phoneId,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data?.error || "No se pudo crear el cliente.");
      }

      setSuccess("Cliente creado correctamente.");
      setFormState(initialState);
    } catch (submitError) {
      setErrors({
        form:
          submitError instanceof Error
            ? submitError.message
            : "No se pudo crear el cliente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-rose-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <a
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:text-amber-600"
            href="/"
          >
            <span className="text-base">←</span>
            Volver
          </a>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Clientes
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Nuevo cliente
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Completa los datos del cliente para usarlo en los pedidos.
          </p>
        </header>

        <form
          className="rounded-3xl border border-amber-100 bg-white/90 p-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.7)]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Nombre completo
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Nombre del cliente"
                maxLength={255}
                required
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Nombre local
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                value={formState.localName}
                onChange={(event) =>
                  handleChange("localName", event.target.value)
                }
                placeholder="Nombre del local"
                maxLength={255}
                required
              />
              {errors.localName && (
                <p className="text-xs text-destructive">{errors.localName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Direccion
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                value={formState.address}
                onChange={(event) => handleChange("address", event.target.value)}
                placeholder="Direccion del cliente"
                maxLength={512}
                required
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Telefono
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                value={formState.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="+56 9 1234 5678"
                inputMode="tel"
                maxLength={20}
                required
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          {errors.form && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.form}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Todos los campos son obligatorios.
            </p>
            <button
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
