import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-fuchsia-500/10 to-background animate-fadeIn" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-cyan-400/20 blur-3xl animate-pulse" />
      </div>

      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur animate-slideDown opacity-0 animation-delay-100">
            <span>{t("notFound.badgeCode")}</span>
            <span className="opacity-60">{t("notFound.badgeSlug")}</span>
          </div>

          <h1 className="mt-6 text-6xl md:text-8xl font-extrabold tracking-tight animate-slideUp opacity-0 animation-delay-300">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{t("notFound.title")}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-slideUp opacity-0 animation-delay-500">{t("notFound.desc")} <span className="font-mono">{location.pathname}</span></p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-slideUp opacity-0 animation-delay-700">
            <Button asChild size="lg">
              <Link to="/">{t("notFound.backHome")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/classify">{t("common.startAnalysis")}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/plans">{t("common.viewPlans")}</Link>
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
            {["/integration","/history","/auth","/profile"].map((p, index) => (
              <Link 
                key={p} 
                to={p} 
                className={`rounded-lg border bg-background/60 p-3 hover:border-primary transition-colors animate-slideUp opacity-0 animation-delay-${900 + (index * 100)}`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 0.1s; animation-fill-mode: both; }
        .animation-delay-300 { animation-delay: 0.3s; animation-fill-mode: both; }
        .animation-delay-500 { animation-delay: 0.5s; animation-fill-mode: both; }
        .animation-delay-700 { animation-delay: 0.7s; animation-fill-mode: both; }
        .animation-delay-900 { animation-delay: 0.9s; animation-fill-mode: both; }
        .animation-delay-1000 { animation-delay: 1.0s; animation-fill-mode: both; }
        .animation-delay-1100 { animation-delay: 1.1s; animation-fill-mode: both; }
        .animation-delay-1200 { animation-delay: 1.2s; animation-fill-mode: both; }
      `}</style>
    </div>
  );
};

export default NotFound;