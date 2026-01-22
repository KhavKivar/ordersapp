import { formatChileanPeso } from "@/utils/format-currency";

type OrderLine = {
  name: string;
  quantity: number;
  pricePerUnit: number;
};

type OrderCardProps = {
  id: number;
  clientName: string;
  localName?: string;
  status: "pending" | "paid" | "delivered" | "delivered_paid" | "cancelled";
  createdAt: string;
  items: OrderLine[];
};

const STATUS_LABELS: Record<OrderCardProps["status"], string> = {
  pending: "Pendiente",
  paid: "Pagado",
  delivered: "Entregado",
  delivered_paid: "Entregado y pagado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<OrderCardProps["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  delivered: "bg-sky-100 text-sky-700",
  delivered_paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function OrderCard({
  id,
  clientName,
  localName,
  status,
  createdAt,
  items,
}: OrderCardProps) {
  const total = items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );

  return (
    <article className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pedido #{id}
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {localName ?? clientName}
          </p>
          {localName && (
            <p className="text-sm text-muted-foreground">{clientName}</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[status]
          }`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={`${item.name}-${item.quantity}`}
            className="flex flex-col gap-1 text-sm"
          >
            <span className="font-medium text-foreground">{item.name}</span>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                {item.quantity} x {formatChileanPeso(item.pricePerUnit)}
              </span>
              <span className="font-semibold text-foreground">
                {formatChileanPeso(item.pricePerUnit * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
        <span className="text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="text-base font-semibold text-foreground">
          {formatChileanPeso(total)}
        </span>
      </div>
    </article>
  );
}
