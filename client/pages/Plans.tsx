import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { SoftBackground } from "@/components/soft-background";
import { Link } from "react-router-dom";

interface Feature {
  id: string;
}
interface Plan {
  uuid: string;
  name: string;
  description?: string;
  features: Feature[];
  price: string;
  token_limit: number;
  days_valid?: number;
  highlight?: boolean;
}

export default function Plans() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Sayfa yüklenme animasyonunu başlat
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/plans/list/`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .finally(() => {
        // Plans yüklendikten sonra kısa bir gecikme ile loading'i kapat
        setTimeout(() => setLoading(false), 300);
      });

    return () => clearTimeout(loadTimer);
  }, []);

  if (loading) {
    return (
      <div className="container py-12 md:py-16 relative min-h-screen flex items-center justify-center">
        <SoftBackground />
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xl font-medium text-muted-foreground animate-pulse">
              {t("loading")}
            </span>
          </div>
          
          {/* Loading skeleton */}
          <div className="mt-16 max-w-6xl w-full">
            {/* Header skeleton */}
            <div className="mx-auto max-w-2xl text-center space-y-4">
              <div className="mx-auto h-6 w-32 bg-muted rounded-full animate-pulse" />
              <div className="mx-auto h-12 w-96 bg-muted rounded-lg animate-pulse" />
              <div className="mx-auto h-6 w-80 bg-muted rounded-lg animate-pulse" />
            </div>
            
            {/* Plans skeleton */}
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl border p-[1px] bg-gradient-to-br from-border to-border animate-pulse`}
                  style={{animationDelay: `${i * 100}ms`}}
                >
                  <Card className="rounded-2xl h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="h-7 w-24 bg-muted rounded animate-pulse" />
                        {i === 1 && (
                          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <div className="h-9 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                        <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                      </div>
                      
                      <div className="mt-5 space-y-2">
                        {[0, 1, 2].map((j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 h-10 w-full bg-muted rounded-lg animate-pulse" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16 relative">
      <SoftBackground />
      
      {/* Animated header section */}
      <div className="mx-auto max-w-2xl text-center">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
          <Zap className="h-3.5 w-3.5" /> {t("plans.badge")}
        </div>
        
        <h1 className={`mt-3 text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-800 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {t("plans.title")}
        </h1>
        
        <p className={`mt-3 text-muted-foreground transition-all duration-800 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t("plans.subtitle")}
        </p>
      </div>

      {/* Animated plans grid */}
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p, index) => (
          <div
            key={p.uuid}
            className={`relative rounded-2xl border p-[1px] transition-all duration-700 hover:scale-105 hover:shadow-2xl group ${
              p.highlight
                ? "bg-gradient-to-br from-primary/40 via-fuchsia-500/30 to-cyan-400/30 shadow-lg"
                : "bg-gradient-to-br from-border to-border hover:from-primary/20 hover:to-primary/10"
            } ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            style={{
              animationDelay: `${600 + index * 150}ms`,
              transitionDelay: `${600 + index * 150}ms`
            }}
          >
            {/* Highlight glow effect */}
            {p.highlight && (
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            )}
            
            <Card className="rounded-2xl backdrop-blur-sm bg-card/95 hover:bg-card transition-colors duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {p.name}
                  </CardTitle>
                  {p.highlight && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary animate-pulse">
                      <Crown className="h-3.5 w-3.5" /> {t("plans.recommended")}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">
                    {t(p.description)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold group-hover:text-primary transition-colors duration-300">
                    {p.price} $
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("plans.perPackage")}
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1 bg-primary/5 hover:bg-primary/10 transition-colors duration-300">
                    {p.token_limit.toLocaleString()} {t("plans.token")}
                  </span>
                  {p.days_valid && (
                    <span className="rounded-full border px-2 py-1 bg-accent/10 hover:bg-accent/20 transition-colors duration-300">
                      {p.days_valid} {t("plans.days")}
                    </span>
                  )}
                </div>
                
                <ul className="mt-5 space-y-2">
                  {p.features.map((f, featureIndex) => (
                    <li 
                      key={f.id} 
                      className={`flex items-center gap-2 text-sm transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{
                        transitionDelay: `${800 + index * 150 + featureIndex * 100}ms`
                      }}
                    >
                      <Check className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:text-foreground transition-colors duration-300">
                        {t(`plans.features.${f}`, {
                          n: p.token_limit.toLocaleString(),
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {p.name.toLowerCase() === "free" ? (
                  <span className="mt-6 w-full block text-center rounded-lg bg-muted/50 py-2 text-muted-foreground cursor-not-allowed transition-all duration-300">
                    {t("plans.buy")}
                  </span>
                ) : (
                  <Button 
                    className={`mt-6 w-full shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${
                      p.highlight 
                        ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary' 
                        : ''
                    }`} 
                    asChild
                  >
                    <Link to={`/payment/confirm?ref=${p.uuid}`}>
                      {t("plans.buy")}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}