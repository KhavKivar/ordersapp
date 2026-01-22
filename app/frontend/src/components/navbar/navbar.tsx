import type { ReactNode } from "react";

import { BackButton } from "@/components/ui/BackButton/backButton";
import { cn } from "@/lib/utils";

type NavbarProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  backLabel?: string;
  className?: string;
};

export default function Navbar({
  title,
  subtitle,
  action,
  showBack = false,
  backLabel,
  className,
}: NavbarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pb-4 pt-3 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {subtitle && (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground">
                {subtitle}
              </p>
            )}
            <div className="flex items-center gap-3">
              {showBack && (
                <BackButton
                  iconOnly
                  label={backLabel}
                />
              )}
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {title}
              </h1>
            </div>
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
    </div>
  );
}
