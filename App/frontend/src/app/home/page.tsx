export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-foreground">
            Vasvani App
          </p>
          <h1 className="text-4xl font-semibold text-foreground">
            Panel principal
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Esta vista esta en construccion. Pronto veras un resumen con los
            pedidos recientes y accesos rapidos.
          </p>
        </header>
        <div className="rounded-3xl border border-dashed border-border bg-card/80 p-10 text-center shadow-lg">
          <p className="text-lg font-semibold text-foreground">
            Vista en desarrollo
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Aqui mostraremos el resumen de pedidos, accesos rapidos y
            notificaciones clave.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground">
            Acciones rapidas
          </p>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            Agregar cliente
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea un nuevo cliente para usarlo en los pedidos manuales.
          </p>
          <a
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            href="/clients/new"
          >
            Crear cliente
          </a>
        </div>
      </div>
      <a
        className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90"
        href="/orders"
        aria-label="Agregar pedido"
        title="Agregar pedido"
      >
        +
      </a>
    </div>
  );
}
