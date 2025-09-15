import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoftBackground } from "@/components/soft-background";
import { Shield, Trophy, Users, Target, Rocket, Clock, CheckCircle2, Bot, MessageSquare, Heart, Star, Award, Zap, Globe, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden min-h-[85vh]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-fuchsia-500/15 to-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-background/70 to-background" />
      </div>
      
      <div className="container py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur bg-background/40">
              <Sparkles className="h-3.5 w-3.5" />
              {t("about.badge") || "Hakkımızda"}
            </div>
            
            <h1 className="mt-4 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              {t("about.title")}
            </h1>
            
            <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t("about.intro")}
            </p>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { icon: <Heart className="h-4 w-4 text-red-500" />, text: "Sevgiyle Yapıldı" },
              { icon: <Star className="h-4 w-4 text-yellow-500" />, text: "Premium Kalite" },
              { icon: <Award className="h-4 w-4 text-primary" />, text: "Ödül Sahibi" },
              { icon: <Shield className="h-4 w-4 text-green-500" />, text: "Güvenli" },
            ].map((item) => (
              <motion.div
                key={item.text}
                className="rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur flex items-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {item.icon}
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { t } = useTranslation();
  const stats = [
    { k: t("about.stats.processed"), v: "25M+", icon: <Zap className="h-5 w-5" /> },
    { k: t("about.stats.latency"), v: "< 80ms", icon: <Clock className="h-5 w-5" /> },
    { k: t("about.stats.accuracy"), v: "%97+", icon: <Target className="h-5 w-5" /> },
    { k: t("about.stats.uptime"), v: "99.9%", icon: <Shield className="h-5 w-5" /> },
  ];

  return (
    <section className="container py-14 md:py-20">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        {stats.map((s, idx) => (
          <motion.div 
            key={s.k}
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="text-center transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3 text-primary">
                  {s.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold">
                  {s.v}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.k}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: t("about.features.security.title"),
      desc: t("about.features.security.desc")
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t("about.features.community.title"),
      desc: t("about.features.community.desc")
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: t("about.features.success.title"),
      desc: t("about.features.success.desc")
    }
  ];

  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Özelliklerimiz</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Size en iyi deneyimi sunmak için geliştirdiğimiz özel özellikler
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {feature.desc}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MissionVisionSection() {
  const { t } = useTranslation();
  
  return (
    <section className="container py-14 md:py-20">
      <motion.div 
        className="rounded-2xl border p-8 md:p-12 bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-cyan-400/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-4">
              <Target className="h-5 w-5" /> 
              {t("about.mission.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("about.mission.desc")}</p>
            <ul className="space-y-3">
              {(t("about.mission.items", { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> 
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5" /> 
              {t("about.vision.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("about.vision.desc")}</p>
            <ul className="space-y-3">
              {(t("about.vision.items", { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> 
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function TimelineSection() {
  const { t } = useTranslation();
  const timeline = [
    { year: "2022", event: t("about.timeline.items.2022") },
    { year: "2023", event: t("about.timeline.items.2023") },
    { year: "2024", event: t("about.timeline.items.2024") },
    { year: "2025", event: t("about.timeline.items.2025") },
  ];

  return (
    <section className="container py-14 md:py-20">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" /> 
          {t("about.timeline.title")}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {timeline.map((item, i) => (
          <motion.div
            key={item.year}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{item.year}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.event}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useTranslation();
  
  return (
    <section className="container pb-20">
      <motion.div 
        className="rounded-2xl border p-8 md:p-12 bg-gradient-to-br from-primary/10 to-fuchsia-500/10 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Bot className="w-8 h-8 text-primary" />
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t("about.cta.title")}
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("about.cta.desc")}
        </p>
      </motion.div>
    </section>
  );
}

export default function About() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <SoftBackground />

      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MissionVisionSection />
      <TimelineSection />
      <CTASection />
    </div>
  );
}