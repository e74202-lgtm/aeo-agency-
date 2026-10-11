"use client";

// From 21st.dev (Pricing Module). Local edits are marked "EDIT:".

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
// EDIT: the site's Origin Button instead of the plain shadcn Button, so every button matches.
import { OriginButton } from "@/components/ui/origin-button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  priceMonthly: number;
  /** EDIT: optional. When no plan has a yearly price, the billing toggle is hidden. */
  priceYearly?: number;
  /** EDIT: show text instead of a number, e.g. "Free". */
  priceLabel?: string;
  /** EDIT: replaces "/ month", e.g. "one-time". Set to "" to hide. */
  periodLabel?: string;
  /** EDIT: optional (was required "users"). Shown under "Overview". */
  overview?: string;
  features: PlanFeature[];
  recommended?: boolean;
  /** EDIT: each plan gets its own button text and link. */
  cta: { label: string; href: string };
}

export interface PricingModuleProps {
  /** EDIT: optional; leave empty when the page already has its own heading. */
  title?: string;
  subtitle?: string;
  annualBillingLabel?: string;
  plans: PricingPlan[];
  defaultAnnual?: boolean;
  className?: string;
}

export function PricingModule({
  title,
  subtitle,
  annualBillingLabel = "Annual billing",
  plans,
  defaultAnnual = false,
  className,
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = React.useState(defaultAnnual);
  const hasYearly = plans.some((p) => p.priceYearly !== undefined);
  const yearly = hasYearly && isAnnual;

  return (
    <section
      className={cn(
        "w-full bg-background text-foreground py-20 px-4 md:px-8",
        className
      )}
    >
      <div className="max-w-6xl mx-auto text-center">
        {title && <h2 className="text-4xl font-bold tracking-tight mb-2">{title}</h2>}
        {subtitle && <p className="text-muted-foreground mb-8">{subtitle}</p>}

        {/* Toggle */}
        {hasYearly && (
          <div className="flex items-center justify-center gap-2 mb-10">
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={(checked) => setIsAnnual(checked)}
            />
            <label
              htmlFor="billing-toggle"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {annualBillingLabel}
            </label>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = yearly ? plan.priceYearly ?? plan.priceMonthly : plan.priceMonthly;
            const period = plan.periodLabel ?? (yearly ? "/ year" : "/ month");
            return (
              <Card
                key={plan.id}
                className={cn(
                  // EDIT: roomier padding and softer corners to match the site's cards
                  "relative overflow-visible rounded-3xl border border-muted ring-0 transition-all [--card-spacing:--spacing(6)] hover:shadow-md hover:border-primary/30",
                  plan.recommended && "border-signal ring-1 ring-signal/30 lg:scale-[1.03]"
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-signal text-signal-foreground text-xs px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}

                <CardHeader className="text-center pt-4">
                  <div className="flex justify-center mb-4">{plan.icon}</div>
                  <CardTitle className="font-display text-xl font-semibold tracking-[-0.02em]">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col text-center">
                  <div className="font-display text-4xl font-semibold tracking-[-0.04em] tabular-nums mb-1 transition-all duration-300">
                    {plan.priceLabel ?? `$${price.toLocaleString("en-US")}`}
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 min-h-5">{period}</p>

                  <OriginButton
                    href={plan.cta.href}
                    variant={plan.recommended ? "primary" : "outline"}
                    className="group w-full mb-6 h-11 px-4 text-sm whitespace-nowrap"
                  >
                    {plan.cta.label}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </OriginButton>

                  <div className="text-left text-sm">
                    {plan.overview && (
                      <>
                        <h4 className="font-semibold mb-2">Overview</h4>
                        {/* EDIT: icon instead of a "✓" text character */}
                        <p className="flex items-start gap-2 text-muted-foreground mb-4">
                          <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                          {plan.overview}
                        </p>
                      </>
                    )}

                    <h4 className="font-semibold mb-2">Highlights</h4>
                    <ul className="space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          {f.included ? (
                            <Check className="mt-0.5 w-4 h-4 shrink-0 text-signal" aria-hidden="true" />
                          ) : (
                            <X className="mt-0.5 w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          )}
                          <span
                            className={f.included
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60 line-through"}
                          >
                            {/* EDIT: screen readers can't see the icons or strike-through */}
                            <span className="sr-only">{f.included ? "Included: " : "Not included: "}</span>
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
