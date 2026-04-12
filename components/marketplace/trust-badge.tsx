import {
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Headphones,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: "shield" | "truck" | "payment" | "return" | "support" | "secure";
  title: string;
  description?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  truck: Truck,
  payment: CreditCard,
  return: RotateCcw,
  support: Headphones,
  secure: Lock,
};

export function TrustBadge({
  icon,
  title,
  description,
  variant = "default",
  className,
}: TrustBadgeProps) {
  const Icon = iconMap[icon];

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-trust/10">
          <Icon className="h-3.5 w-3.5 text-trust" />
        </div>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn("flex flex-col items-center gap-2 text-center", className)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust/10">
          <Icon className="h-5 w-5 text-trust" />
        </div>
        <span className="text-xs font-medium text-foreground">{title}</span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-trust/10">
        <Icon className="h-6 w-6 text-trust" />
      </div>
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function TrustSection() {
  const badges = [
    {
      icon: "shield" as const,
      title: "Verified Sellers",
      description: "All sellers verified for quality and authenticity",
    },
    {
      icon: "truck" as const,
      title: "Fast Delivery",
      description: "Nationwide delivery across Morocco in 24-72h",
    },
    {
      icon: "payment" as const,
      title: "Secure Payment",
      description: "Multiple secure payment options including COD",
    },
    {
      icon: "return" as const,
      title: "Easy Returns",
      description: "14-day hassle-free return policy",
    },
  ];

  return (
    <section className="border-y border-border/50 bg-secondary/30 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">
            Why Shop with Rahba?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Trust, quality, and exceptional service
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {badges.map((badge) => (
            <TrustBadge
              key={badge.icon}
              icon={badge.icon}
              title={badge.title}
              description={badge.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
