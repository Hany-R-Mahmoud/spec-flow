import { useReducedMotion, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  ClipboardList,
  FileDown,
  GitBranch,
  Layers3,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { HeroGeometric } from "@/components/landing/Hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeModeToggle } from "@/components/shared/ThemeModeToggle";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl space-y-4", center && "mx-auto text-center")}>
      <Badge
        variant="outline"
        className="border-border/70 bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {eyebrow}
      </Badge>
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className={cn("text-base leading-7 text-muted-foreground sm:text-lg", center && "mx-auto max-w-2xl")}>
        {description}
      </p>
    </div>
  );
}

const trustChips = [
  "Product managers",
  "Design leads",
  "Engineering managers",
  "Delivery ops",
];

const adoptionTabs = [
  { value: "why-it-breaks", label: "Why it breaks" },
  { value: "why-specflow", label: "Why SpecFlow" },
  { value: "what-changes", label: "What changes" },
] as const;

const problemPoints = [
  {
    title: "Ideas live in too many places",
    description: "Briefs, chat, and tickets drift apart before a spec is ever finished.",
    icon: ClipboardList,
  },
  {
    title: "Stories start inconsistent",
    description: "Manual breakdowns lose context, ownership, and the reason behind each request.",
    icon: Layers3,
  },
  {
    title: "Review takes too long",
    description: "Teams spend time cleaning scope instead of resolving actual product risk.",
    icon: Workflow,
  },
];

const solutionPoints = [
  "One guided flow from rough idea to export-ready artifacts.",
  "Structured stories that keep context, intent, and constraints attached.",
  "Review-first output that makes handoff to delivery tools cleaner.",
];

const features = [
  {
    title: "Guided breakdowns",
    description: "Start from a rough brief and move through a clear product workflow.",
    icon: Layers3,
  },
  {
    title: "Project input capture",
    description: "Collect goals, constraints, labels, and audience context in one place.",
    icon: ClipboardList,
  },
  {
    title: "BYOK generation",
    description: "Connect your own AI provider key to turn project input into structured stories.",
    icon: GitBranch,
  },
  {
    title: "Review and refine",
    description: "Tighten language, resolve gaps, and keep the spec readable for the team.",
    icon: Sparkles,
  },
  {
    title: "Export readiness",
    description: "Prepare clean artifacts for Jira, delivery workflows, or downstream sync.",
    icon: FileDown,
  },
  {
    title: "Team alignment",
    description: "Keep product, design, and engineering working from the same source of truth.",
    icon: Users,
  },
];

const steps = [
  {
    title: "Start a breakdown",
    description: "Drop in the idea, goal, or messy notes and let SpecFlow shape the scope.",
  },
  {
    title: "Configure project input",
    description: "Add audience, constraints, labels, and anything the workflow needs to know.",
  },
  {
    title: "Generate structured stories",
    description: "Move from broad intent to concrete, reviewable stories with one click.",
  },
  {
    title: "Review and refine",
    description: "Use the review pass to tighten scope, resolve ambiguity, and keep quality high.",
  },
  {
    title: "Export downstream",
    description: "Send the finished work into your delivery tools with less cleanup.",
  },
];

const testimonials = [
  {
    quote:
      "SpecFlow AI gives us a repeatable way to turn fuzzy ideas into a spec the whole team can use.",
    name: "Product Lead",
    role: "Placeholder testimonial",
  },
  {
    quote:
      "The review step matters. It keeps the output structured without feeling rigid or overengineered.",
    name: "Design Manager",
    role: "Placeholder testimonial",
  },
  {
    quote:
      "We spend less time rewriting stories and more time actually shipping the right work.",
    name: "Engineering Manager",
    role: "Placeholder testimonial",
  },
];

const faqs = [
  {
    question: "What does SpecFlow AI generate?",
    answer:
      "With a connected provider key, it turns a project brief into a structured breakdown, stories, review context, and export-ready output. Without a key, the same flow stays manual and organizational.",
  },
  {
    question: "Can I review before exporting?",
    answer:
      "Yes. Review and refinement are part of the core flow before anything is exported downstream.",
  },
  {
    question: "Does it replace my issue tracker?",
    answer:
      "No. SpecFlow AI prepares clean work for the tools your team already uses.",
  },
  {
    question: "What kind of input can I start from?",
    answer:
      "A rough idea, a product brief, meeting notes, or any draft that needs structure.",
  },
  {
    question: "Is it useful for cross-functional teams?",
    answer:
      "Yes. The flow is built to keep product, design, and engineering aligned around one spec.",
  },
];

function LandingHeader({
  startHref,
  signInHref,
}: {
  startHref: string;
  signInHref: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold text-foreground sm:text-base">SpecFlow AI</div>
            <div className="hidden text-xs text-muted-foreground sm:block">Structured product flow</div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Landing navigation">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeModeToggle className="shrink-0" />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <a href={signInHref}>Sign in</a>
          </Button>
          <Button asChild>
            <a href={startHref}>
              Start a breakdown
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LandingPage() {
  const { isSignedIn } = useAuth();
  const startHref = isSignedIn ? "/app/new" : "/login";
  const signInHref = isSignedIn ? "/app" : "/login";
  const secondaryHeroHref = isSignedIn ? "/app" : "#how-it-works";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div id="top" />
      <LandingHeader startHref={startHref} signInHref={signInHref} />

      <main>
        <HeroGeometric
          badge="BYOK supported"
          primaryHref={startHref}
          primaryLabel="Start a breakdown"
          secondaryHref={secondaryHeroHref}
          secondaryLabel={isSignedIn ? "Open app" : "See how it works"}
        />

        <section className="border-b border-border/70">
          <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
            <div className="rounded-[28px] border border-border/80 bg-card/85 px-6 py-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur md:px-8 md:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Built for product teams
                  </div>
                  <div className="text-sm leading-6 text-foreground">
                    Fewer handoff gaps. Cleaner specs. A workflow the whole team can read without translating it.
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
                  {trustChips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
          <Reveal>
            <div className="space-y-5">
              <SectionHeading
                eyebrow="Why teams adopt it"
                title="Replace scattered notes with one guided product flow."
                description="SpecFlow AI keeps the work moving from rough input to structured output without making the team fight the format."
              />
            </div>
          </Reveal>

          <div className="mt-12 flex flex-wrap gap-2 text-xs">
            {["5-step guided workflow", "Review-first story output", "Export-ready handoff", "BYOK supported"].map(
              (item) => (
                <span key={item} className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-muted-foreground shadow-sm">
                  {item}
                </span>
              ),
            )}
          </div>

          <Tabs defaultValue={adoptionTabs[0].value} className="mt-12 space-y-6">
            <TabsList className="inline-flex h-auto flex-wrap rounded-full border border-border bg-card p-1 shadow-sm">
              {adoptionTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="why-it-breaks" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <Reveal>
                  <Card className="h-full overflow-hidden border-border/70 bg-card/80">
                    <div className="border-b border-border/70 bg-muted/30 px-6 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Planning friction
                      </div>
                    </div>
                    <CardContent className="space-y-4 p-6">
                      {problemPoints.map((point) => {
                        const Icon = point.icon;
                        return (
                          <div key={point.title} className="flex gap-4 rounded-2xl border border-border bg-background/70 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{point.title}</p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{point.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </Reveal>

                <Reveal delay={0.05}>
                  <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-card">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">What SpecFlow AI does instead</CardTitle>
                      <CardDescription>One flow. One spec. Less cleanup later.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-3xl border border-border bg-background/80 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <BadgeCheck className="h-4 w-4 text-emerald-500" />
                          Outcome
                        </div>
                        <p className="mt-3 text-base leading-7 text-muted-foreground">
                          A guided breakdown turns the rough idea into structured stories, review context, and export-ready
                          work that fits the team’s delivery process.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {solutionPoints.map((point, index) => (
                          <div key={point} className="rounded-2xl border border-border bg-background/75 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              0{index + 1}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            <TabsContent value="why-specflow" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <Reveal>
                  <Card className="h-full overflow-hidden border-border/70 bg-card/80">
                    <div className="border-b border-border/70 bg-muted/30 px-6 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Why teams keep it
                      </div>
                    </div>
                    <CardContent className="space-y-3 p-6">
                      {solutionPoints.map((point, index) => (
                        <div key={point} className="rounded-2xl border border-border bg-background/75 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            0{index + 1}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-foreground">{point}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Reveal>

                <Reveal delay={0.05}>
                  <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-card">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">What changes in practice</CardTitle>
                      <CardDescription>The workflow stays readable from start to finish.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {steps.slice(0, 3).map((step, index) => (
                        <div key={step.title} className="flex gap-4 rounded-2xl border border-border bg-background/75 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-sm font-semibold text-primary">
                            0{index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>

            <TabsContent value="what-changes" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <Reveal>
                  <Card className="h-full overflow-hidden border-border/70 bg-card/80">
                    <div className="border-b border-border/70 bg-muted/30 px-6 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        What the workflow changes
                      </div>
                    </div>
                    <CardContent className="space-y-4 p-6">
                      {steps.map((step, index) => (
                        <div key={step.title} className="flex gap-4 rounded-2xl border border-border bg-background/70 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-sm font-semibold text-primary">
                            0{index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Reveal>

                <Reveal delay={0.05}>
                  <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-card">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">What it enables</CardTitle>
                      <CardDescription>Cleaner specs, less rewriting, and better delivery alignment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {["A single source of truth for the breakdown.", "Structured output that stays easy to review.", "Exports that need less cleanup before shipping."].map(
                        (point, index) => (
                          <div key={point} className="rounded-2xl border border-border bg-background/75 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              0{index + 1}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-foreground">{point}</p>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section id="features" className="border-y border-border/70 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <Reveal>
              <SectionHeading
                eyebrow="Feature grid"
                title="Everything centers on the breakdown workflow."
                description="Each feature is shaped around the core loop: start a breakdown, configure project input, use BYOK generation when enabled, review, and export."
              />
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} delay={index * 0.04}>
                    <Card className="h-full border-border/70 bg-card/85 transition-transform duration-200 hover:-translate-y-0.5">
                      <CardHeader className="space-y-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Five steps. One clear path to export-ready work."
              description="The motion and structure stay simple so the workflow feels obvious on first use."
            />
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/80">
                  <CardHeader className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary">
                      0{index + 1}
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="benefits" className="border-y border-border/70 bg-muted/25">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <div className="space-y-6">
                <SectionHeading
                  eyebrow="Benefit section"
                  title="Less rewriting. More alignment. Cleaner exports."
                  description="The goal is not more process. It is clearer decisions, fewer dropped details, and specs the team can trust."
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
                    <Workflow className="mr-2 h-3.5 w-3.5" />
                    Faster handoffs
                  </Badge>
                  <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                    Better consistency
                  </Badge>
                  <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    Review-friendly output
                  </Badge>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Reveal delay={0.04}>
                <Card className="border-border/70 bg-card/85">
                  <CardHeader>
                    <CardTitle className="text-lg">Shared source of truth</CardTitle>
                    <CardDescription className="leading-6">
                      Keep product intent, constraints, and story structure together instead of across three tools.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
              <Reveal delay={0.08}>
                <Card className="border-border/70 bg-card/85">
                  <CardHeader>
                    <CardTitle className="text-lg">Less cleanup after review</CardTitle>
                    <CardDescription className="leading-6">
                      Structured output means fewer rewrites when delivery work starts.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
              <Reveal delay={0.12}>
                <Card className="border-border/70 bg-card/85 sm:col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Built for practical product teams</CardTitle>
                    <CardDescription className="leading-6">
                      The flow stays flexible enough for real-world input but disciplined enough to keep quality high.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Testimonials"
              title="Placeholder quotes for the first homepage pass."
              description="These can be replaced with real customer stories later. For now, they signal the kind of value the product creates."
              center
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.05}>
                <Card className="h-full border-border/70 bg-card/85">
                  <CardHeader className="space-y-4">
                    <Quote className="h-5 w-5 text-primary" />
                    <CardDescription className="text-base leading-7 text-foreground">
                      “{testimonial.quote}”
                    </CardDescription>
                    <div>
                      <CardTitle className="text-sm">{testimonial.name}</CardTitle>
                      <div className="mt-1 text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-border/70 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ"
                title="Short answers to the most common questions."
                description="Keep this concise now. Expand later if users need more detail."
              />
            </Reveal>

            <Reveal delay={0.04}>
              <Card className="mt-12 border-border/70 bg-card/85">
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="px-6">
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.question} value={faq.question}>
                        <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                          <span className="flex items-center gap-2">
                            <CircleHelp className="h-4 w-4 text-primary" />
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm leading-7 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <Reveal>
            <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(14,165,233,0.06),transparent_68%)] shadow-[0_20px_60px_-36px_rgba(15,23,42,0.45)]">
              <CardContent className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                    Ready to move
                  </div>
                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Start the next spec with less friction.
                  </h2>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                    Use SpecFlow AI to move from idea to structured stories, review, and export without rebuilding the
                    process every time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Breakdown", "Review", "Export"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 lg:justify-self-end">
                  <div className="rounded-3xl border border-border bg-card/80 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Next step
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      Open the app, start a breakdown, and move the idea into a structured workflow.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/15">
                      <a href={startHref}>
                        Start a breakdown
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-border/70 bg-background/75">
                      <a href={isSignedIn ? "/app" : "#top"}>{isSignedIn ? "Open app" : "Back to top"}</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-foreground">
                  SpecFlow <span className="text-primary">AI</span>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  BYOK spec breakdowns for product teams. Connect your provider key for generation, or use manual
                  mode to organize, review, and export with less handoff friction.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Product
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#features" className="block transition-colors hover:text-foreground">
                  Features
                </a>
                <a href="#how-it-works" className="block transition-colors hover:text-foreground">
                  How it works
                </a>
                <a href="#faq" className="block transition-colors hover:text-foreground">
                  FAQ
                </a>
                <a href={isSignedIn ? "/app" : "/login"} className="block transition-colors hover:text-foreground">
                  Open app
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Company
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <a key={item} href="#" className="block transition-colors hover:text-foreground">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Legal
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <a key={item} href="#" className="block transition-colors hover:text-foreground">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-10" />

          <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 SpecFlow AI. All rights reserved.</span>
            <div className="flex flex-wrap gap-6">
              <a href="#" className="transition-colors hover:text-foreground">
                Twitter
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                GitHub
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
