import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
import { FloatingButton } from "@/components/ui/FloatingButton/floatingButton";
import Header from "@/components/ui/Header/header";
import SubHeader from "@/components/ui/Header/subHeader";
import { Spacer } from "@/components/ui/Spacer/spacer";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen ">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-12 pt-4 sm:pt-8 lg:pt-12">
        <header className="space-y-3">
          <SubHeader text="Vasvani App" />
          <Header text="Panel Principal" />
          <p className="max-w-2xl text-base text-muted-foreground">
            Esta vista esta en construccion. Pronto veras un resumen con los
            pedidos recientes y accesos rapidos.
          </p>
        </header>
        <Card>
          <p className="text-lg font-semibold text-foreground">
            Vista en desarrollo
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Aqui mostraremos el resumen de pedidos, accesos rapidos y
            notificaciones clave.
          </p>
        </Card>
        <Card className="bg-card/90 p-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground">
            Acciones rapidas
          </p>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            Agregar cliente
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea un nuevo cliente para usarlo en los pedidos manuales.
          </p>
          <Spacer />
          <Button
            variant={"secondary"}
            onClick={() => navigate("/clients/new")}
          >
            Crear Cliente
          </Button>
        </Card>
      </div>
      <FloatingButton
        label="Agregar pedido"
        title="Agregar pedido"
        onClick={() => navigate("/orders")}
      />
    </div>
  );
}
