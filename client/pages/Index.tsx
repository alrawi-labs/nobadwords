import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Sparkles,
  BarChart3,
  Zap,
  Code2,
  Quote,
  CheckCircle2,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/userContext";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const { user } = useUser();
  const { t } = useTranslation();
  const perks = t("hero.perks", { returnObjects: true }) as string[];
  const testimonials = t("testimonials.items", {
    returnObjects: true,
  }) as string[];
  const languages = [
    {
      name: "languages.nameAr",
      flag: "languages.flagAr",
      support: "languages.full",
      description: "languages.fullDescription",
      example: "languages.exampleAr",
      features: [
        "languages.highAccuracy",
        "languages.fastProcessing",
        "languages.comprehensiveDictionary",
      ],
      rtl: true,
    },
    {
      name: "languages.nameTr",
      flag: "languages.flagTr",
      support: "languages.full",
      description: "languages.fullDescription",
      example: "languages.exampleTr",
      features: [
        "languages.highAccuracy",
        "languages.fastProcessing",
        "languages.comprehensiveDictionary",
      ],
    },
    {
      name: "languages.nameEn",
      flag: "languages.flagEn",
      support: "languages.partial",
      description: "languages.partialDescription",
      example: "languages.exampleEn",
      features: ["languages.basicFiltering", "languages.continuousImprovement"],
    },
  ];

  const frameContainerRef = useRef<HTMLDivElement>(null);
  const totalFrames = 24;
  const maxScroll = 250;
  const framesRef = useRef<HTMLImageElement[]>([]);

  // Scroll animation state
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Multi-directional animation system
  const getAnimationClass = (sectionId, index = 0) => {
    const directions = ["translate-y-8", "translate-x-8", "-translate-x-8"];
    const direction = directions[index % directions.length];

    return visibleSections.has(sectionId)
      ? "opacity-100 translate-y-0 translate-x-0"
      : `opacity-0 ${direction}`;
  };

  // Original frame animation
  useEffect(() => {
    const container = frameContainerRef.current;
    if (!container) return;

    const frames: HTMLImageElement[] = [];
    for (let i = totalFrames - 1; i >= 0; i--) {
      const img = new Image();
      img.src = `frames/${String(i).padStart(3, "0")}.png`;
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.opacity = i === 0 ? "1" : "0";
      container.appendChild(img);
      frames.push(img);
    }
    framesRef.current = frames;

    const handleScroll = () => {
      const scrollY = Math.min(window.scrollY, maxScroll);
      const fraction = scrollY / maxScroll;
      const frameIndex =
        totalFrames - 1 - Math.floor(fraction * (totalFrames - 1));
      frames.forEach(
        (img, idx) => (img.style.opacity = idx === frameIndex ? "1" : "0"),
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -150px 0px",
      },
    );

    // Observe all sections with animation
    const sections = document.querySelectorAll("[data-scroll-animate]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh]">
        <div className="absolute inset-0 -z-10">
          <div
            ref={frameContainerRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ pointerEvents: "none" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/40 to-background" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-fuchsia-500/15 to-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-background/70 to-background" />
        </div>
        <div className="container py-24 md:py-36">
         <div className="max-w-3xl mx-auto text-center">
  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur bg-background/40">
    <Sparkles className="h-3.5 w-3.5" />
    {t("hero.badge")}
  </div>
  <h1 className="mt-4 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
    {t("hero.title")}
  </h1>
  <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
    {t("hero.desc")}
  </p>
  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
    <Button asChild size="lg">
      <Link to="/classify">{t("common.startAnalysis")}</Link>
    </Button>
    {!user && (
      <Button asChild variant="outline" size="lg">
        <Link to="/auth">{t("common.loginRegister")}</Link>
      </Button>
    )}
  </div>
  <p className="mt-3 text-sm text-muted-foreground">
    {t("hero.limitInfo")}
  </p>
</div>


          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {perks.map((s, index) => (
              <div
                key={s}
                className="rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur opacity-0 animate-fade-up"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section
        className="container py-14 md:py-20"
        id="languages-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("languages-section")}`}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur bg-background/40 mb-4">
              <Globe className="h-3.5 w-3.5" />
              {t("languages.title")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("languages.subtitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("languages.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {languages.map((lang, index) => (
              <div
                key={t(lang.name)}
                className={`transition-all duration-700 ease-out ${getAnimationClass("languages-section", index + 1)}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{t(lang.flag)}</span>
                        <CardTitle className="text-xl">
                          {t(lang.name)}
                        </CardTitle>
                      </div>
                      <Badge className="gap-1">{t(lang.support)}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(lang.description)}
                    </p>

                    <div
                      className={
                        lang.rtl
                          ? "rounded-lg bg-muted/50 p-3 border-r-4 border-r-primary/50"
                          : "rounded-lg bg-muted/50 p-3 border-l-4 border-l-primary/50"
                      }
                    >
                      <p
                        className="text-xs text-muted-foreground font-mono"
                        style={{ direction: lang.rtl ? "rtl" : "ltr" }}
                      >
                        {t(lang.example)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {lang.features.map((feature, featureIndex) => (
                        <Badge
                          key={featureIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {t(feature)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <div
                    className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${
                      lang.support === "full"
                        ? "from-green-500/10 to-transparent"
                        : "from-blue-500/10 to-transparent"
                    } rounded-bl-full`}
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="container py-14 md:py-20"
        id="features-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("features-section")}`}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("features.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: t("features.secureModeration.title"),
                desc: t("features.secureModeration.desc"),
              },
              {
                icon: <Zap className="h-5 w-5 text-primary" />,
                title: t("features.easyIntegration.title"),
                desc: t("features.easyIntegration.desc"),
              },
              {
                icon: <BarChart3 className="h-5 w-5 text-primary" />,
                title: t("features.historyAnalytics.title"),
                desc: t("features.historyAnalytics.desc"),
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`transition-all duration-700 ease-out ${getAnimationClass("features-section", index + 1)}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {feature.desc}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos */}
      <section
        className="container py-10"
        id="logos-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("logos-section")}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-70">
            {[""].map((l) => (
              <div
                key={l}
                className="text-center text-sm md:text-base font-semibold tracking-wider text-muted-foreground"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="container py-14 md:py-20"
        id="how-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("how-section")}`}
        >
          <h2 className="text-2xl md:text-3xl font-bold">{t("how.title")}</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {
                t: t("how.steps.0.title"),
                d: t("how.steps.0.desc"),
                i: <Code2 className="h-5 w-5" />,
              },
              {
                t: t("how.steps.1.title"),
                d: t("how.steps.1.desc"),
                i: <Sparkles className="h-5 w-5" />,
              },
              {
                t: t("how.steps.2.title"),
                d: t("how.steps.2.desc"),
                i: <CheckCircle2 className="h-5 w-5" />,
              },
            ].map((s, index) => (
              <div
                key={s.t}
                className={`transition-all duration-700 ease-out ${getAnimationClass("how-section", index + 1)}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      {s.i}
                    </div>
                    <CardTitle>{s.t}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {s.d}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code sample */}
      <section
        className="container py-14"
        id="code-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("code-section")}`}
        >
          <div className="rounded-2xl border p-6 md:p-8 bg-background">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code2 className="h-5 w-5" /> {t("common.apiUsage")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `curl -X POST https://api.nobadwords.dev/classify -H 'Authorization: Bearer YOUR_API_KEY' -H 'Content-Type: application/json' -d '{\"text\":\"${t("code.exampleText")}\"}'`,
                  )
                }
              >
                {t("common.copyCode")}
              </Button>
            </div>
            <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs md:text-sm">
              <code>{`curl -X POST https://api.nobadwords.dev/classify \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"örnek metin"}'

# Response
{
  "predicted_class": 1,
  "toxic_words": ["ornek"],
  "toxic_ratio": 92.0,
  "tokens": 1460,
  "is_temp": false
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="container py-14"
        id="testimonials-section"
        data-scroll-animate
      >
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("testimonials-section")}`}
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            {t("testimonials.title")}
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {testimonials.map((q, index) => (
              <div
                key={q}
                className={`transition-all duration-700 ease-out ${getAnimationClass("testimonials-section", index + 1)}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-muted-foreground flex gap-2">
                      <Quote className="h-5 w-5" /> {q}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-14" id="faq-section" data-scroll-animate>
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("faq-section")}`}
        >
          <h2 className="text-2xl md:text-3xl font-bold">{t("faq.title")}</h2>
          <div className="mt-4 rounded-2xl border p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>{t("faq.q1")}</AccordionTrigger>
                <AccordionContent>{t("faq.a1")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>{t("faq.q2")}</AccordionTrigger>
                <AccordionContent>{t("faq.a2")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>{t("faq.q3")}</AccordionTrigger>
                <AccordionContent>{t("faq.a3")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20" id="cta-section" data-scroll-animate>
        <div
          className={`transition-all duration-700 ease-out ${getAnimationClass("cta-section")}`}
        >
          <div className="rounded-2xl border p-8 md:p-12 bg-gradient-to-br from-primary/10 to-fuchsia-500/10">
            <h2 className="text-2xl md:text-3xl font-bold">{t("cta.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("cta.desc")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/classify">{t("common.tryNow")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/plans">{t("common.viewPlans")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
