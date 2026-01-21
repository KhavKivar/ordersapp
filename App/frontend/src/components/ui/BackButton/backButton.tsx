import * as React from "react";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";

type BackButtonProps = React.ComponentProps<"button"> & {
  label?: string;
  fallbackTo?: string;
};

function BackButton({
  label = "Volver",
  fallbackTo,
  onClick,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (fallbackTo && window.history.length <= 1) {
      navigate(fallbackTo);
      return;
    }

    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "cursor-pointer inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accen transition hover:text-foreground",
        props.className,
      )}
      {...props}
    >
      <span className="text-base">←</span>
      {label}
    </button>
  );
}

export { BackButton };
