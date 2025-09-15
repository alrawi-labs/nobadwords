import { SoftBackground } from "@/components/soft-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 md:py-16 relative">
      <SoftBackground />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-slideUp opacity-0 animation-delay-100">
          {t("privacyPage.title")}
        </h1>
        <p className="mt-3 text-muted-foreground animate-slideUp opacity-0 animation-delay-300">
          {t("privacyPage.desc")}
        </p>

        <Card className="mt-8 backdrop-blur supports-[backdrop-filter]:bg-card/80 animate-slideUp opacity-0 animation-delay-500">
          <CardHeader>
            <CardTitle className="animate-slideUp opacity-0 animation-delay-700">
              {t("privacyPage.summaryTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="animate-slideUp opacity-0 animation-delay-800">
              {t("privacyPage.summary.p1")}
            </p>
            <p className="animate-slideUp opacity-0 animation-delay-900">
              {t("privacyPage.summary.p2")}
            </p>
            <p className="animate-slideUp opacity-0 animation-delay-1000">
              {t("privacyPage.summary.p3")}
            </p>
            <p className="animate-slideUp opacity-0 animation-delay-1100">
              {t("privacyPage.summary.p4")}
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 animate-slideUp opacity-0 animation-delay-1200">
          <CardHeader>
            <CardTitle className="animate-slideUp opacity-0 animation-delay-1300">
              {t("privacyPage.rightsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="animate-slideUp opacity-0 animation-delay-1400">
              {t("privacyPage.rights.p1")}
            </p>
            <p className="animate-slideUp opacity-0 animation-delay-1500">
              {t("privacyPage.rights.p2")}
            </p>
          </CardContent>
        </Card>
      </div>

      <style>{`
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

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 0.1s; animation-fill-mode: both; }
        .animation-delay-300 { animation-delay: 0.3s; animation-fill-mode: both; }
        .animation-delay-500 { animation-delay: 0.5s; animation-fill-mode: both; }
        .animation-delay-700 { animation-delay: 0.7s; animation-fill-mode: both; }
        .animation-delay-800 { animation-delay: 0.8s; animation-fill-mode: both; }
        .animation-delay-900 { animation-delay: 0.9s; animation-fill-mode: both; }
        .animation-delay-1000 { animation-delay: 1.0s; animation-fill-mode: both; }
        .animation-delay-1100 { animation-delay: 1.1s; animation-fill-mode: both; }
        .animation-delay-1200 { animation-delay: 1.2s; animation-fill-mode: both; }
        .animation-delay-1300 { animation-delay: 1.3s; animation-fill-mode: both; }
        .animation-delay-1400 { animation-delay: 1.4s; animation-fill-mode: both; }
        .animation-delay-1500 { animation-delay: 1.5s; animation-fill-mode: both; }
      `}</style>
    </div>
  );
}