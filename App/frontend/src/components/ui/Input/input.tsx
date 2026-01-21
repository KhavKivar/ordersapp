import { cn } from "@/lib/utils";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  placeholder: string;
  className?: string;
  registration: Partial<UseFormRegisterReturn>;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  placeholder,
  className,
  registration,
  ...props
}: InputProps) {
  const baseStyle =
    "w-full rounded-md border border-slate-200 bg- px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100";
  return (
    <input
      className={cn(baseStyle, className)}
      placeholder={placeholder}
      {...registration}
      {...props}
    />
  );
}
