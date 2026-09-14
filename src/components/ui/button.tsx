import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white shadow-[0_4px_16px_rgba(10,132,255,0.28)] hover:brightness-105",
        secondary: "glass text-[var(--foreground)] hover:brightness-[1.03]",
        ghost: "text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]",
        success: "bg-[var(--success)] text-white hover:brightness-105",
        danger: "bg-[var(--danger)] text-white hover:brightness-105",
        outline:
          "border border-[color-mix(in_srgb,var(--foreground)_16%,transparent)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]",
      },
      size: {
        sm: "h-9 px-3 text-[13px]",
        md: "h-11 px-4 text-[15px]",
        lg: "h-12 px-5 text-[16px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  type = "button",
  asChild,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
