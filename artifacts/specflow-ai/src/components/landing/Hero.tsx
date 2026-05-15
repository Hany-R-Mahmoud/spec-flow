import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Circle, ChevronRight, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { appPath } from "@/lib/routes";
import { useAuth } from "@/components/providers/auth-provider";
import { Link } from "wouter";

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
};

type HeroGeometricProps = {
  badge?: string;
  title1?: string;
  title2?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: ElegantShapeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border border-border/70",
            "shadow-[0_10px_40px_0_rgba(15,23,42,0.08)] dark:shadow-[0_10px_40px_0_rgba(255,255,255,0.06)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function HeroGeometric({
  badge = "SpecFlow AI",
  title1 = "From rough idea to",
  title2 = "review-ready stories",
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeroGeometricProps) {
  const reduceMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  const resolvedPrimaryHref = primaryHref ?? (isSignedIn ? appPath() : "/login");
  const resolvedPrimaryLabel = primaryLabel ?? (isSignedIn ? "Open app" : "Start a breakdown");
  const resolvedSecondaryHref = secondaryHref ?? (isSignedIn ? appPath("/new") : "#how-it-works");
  const resolvedSecondaryLabel = secondaryLabel ?? (isSignedIn ? "Create new breakdown" : "See how it works");

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        delay: 0.2 + i * 0.14,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.02)_22%,transparent_54%)]" />
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.25}
          width={620}
          height={150}
          rotate={12}
          gradient="from-primary/15"
          className="left-[-9%] top-[12%] md:left-[-4%] md:top-[18%]"
        />
        <ElegantShape
          delay={0.45}
          width={460}
          height={118}
          rotate={-14}
          gradient="from-[rgba(14,165,233,0.16)]"
          className="right-[-5%] top-[66%] md:right-[1%] md:top-[72%]"
        />
        <ElegantShape
          delay={0.35}
          width={260}
          height={78}
          rotate={-8}
          gradient="from-[rgba(37,99,235,0.14)]"
          className="left-[7%] bottom-[8%] md:left-[11%] md:bottom-[12%]"
        />
        <ElegantShape
          delay={0.55}
          width={190}
          height={58}
          rotate={18}
          gradient="from-[rgba(16,185,129,0.14)]"
          className="right-[14%] top-[10%] md:right-[18%] md:top-[14%]"
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] md:px-8 md:py-20 lg:px-10">
        <div className="max-w-3xl">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            <Circle className="h-2 w-2 fill-primary text-primary" aria-hidden="true" />
            <span>{badge}</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible" className="mt-8">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {title1} <span className="text-primary">{title2}</span>
            </h1>
          </motion.div>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Start a breakdown, shape the project input, and move the work forward with BYOK or manual mode.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="h-11 rounded-full px-5 shadow-sm">
              <Link href={resolvedPrimaryHref}>
                {resolvedPrimaryLabel}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {isSignedIn ? (
              <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-5">
                <Link href={resolvedSecondaryHref}>{resolvedSecondaryLabel}</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-5">
                <a href={resolvedSecondaryHref}>{resolvedSecondaryLabel}</a>
              </Button>
            )}
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap gap-2 text-xs"
          >
            {[
              "5-step guided workflow",
              "Review-first story output",
              "Export-ready handoff",
              "BYOK supported",
            ].map((item) => (
              <span key={item} className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-muted-foreground shadow-sm">
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 0.86, 0.39, 0.96] }}
          className="relative"
        >
          <Card className="overflow-hidden border-border/80 bg-card/85 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardContent className="space-y-5 p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Live workflow preview
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Breakdown to export, without the generic dashboard noise.
                  </p>
                </div>
                <div className="inline-flex items-center whitespace-nowrap rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:text-emerald-200">
                  Ready for review
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Active breakdowns", value: "12", tone: "text-primary" },
                  { label: "Avg readiness", value: "86/100", tone: "text-emerald-600 dark:text-emerald-300" },
                  { label: "Needs review", value: "08", tone: "text-amber-600 dark:text-amber-300" },
                  { label: "Export ready", value: "04", tone: "text-cyan-600 dark:text-cyan-300" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-background/80 p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className={cn("mt-2 text-2xl font-semibold tabular-nums", item.tone)}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Workflow className="h-4 w-4 text-primary" aria-hidden="true" />
                  Breakdown pipeline
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    "1. Start a breakdown",
                    "2. Configure project input",
                    "3. Generate structured stories",
                    "4. Review and refine",
                    "5. Export downstream",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{step.replace(/^\d+\.\s/, "")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export function Hero() {
  return <HeroGeometric />;
}
