import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SoftBackground } from "@/components/soft-background";
import { CheckCircle2, ShieldCheck, Lock, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";
import { useTranslation } from "react-i18next";

interface Plan {
  uuid: string;
  name: string;
  description: string;
  price: string;
  token_limit: number;
  days_valid?: number;
}

export default function PaymentConfirm() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const ref = params.get("ref"); // uuid gibi

  const [method, setMethod] = useState<string>(params.get("gateway") || "iyzico");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [accepted, setAccepted] = useState<boolean>(false);

  // ✅ Planı backend'den çek
  useEffect(() => {
    async function fetchPlan() {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/plans/get_plan/${ref}/`);
        const data = await res.json();
        if (!res.ok){
          toast.error(t(data.detail))
        }
        setPlan(data);
      } catch (err) {
        toast.error(t(err.detail));
      } finally {
        setLoading(false);
      }
    }
    if (ref) fetchPlan();
  }, [ref]);

  function confirm() {
    if (!accepted) {
      setPolicyOpen(true);
      return;
    }

    const tx = `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    let email = "guest@nobadwords.dev";

    try {
      const uid = localStorage.getItem("nbw_user_id");
      const users = JSON.parse(localStorage.getItem("nbw_users") || "[]") as any[];
      const u = users.find((x) => x.id === uid);
      if (u?.email) email = u.email;
    } catch {}

    const payment = {
      gateway: method,
      transaction_id: tx,
      user: { email },
      plan: { name: plan?.name },
      amount: plan?.price,
      state: "paid",
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem("nbw_payments");
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      arr.unshift(payment);
      localStorage.setItem("nbw_payments", JSON.stringify(arr.slice(0, 100)));
    } catch {}

    toast.success(t("paymentConfirm.toastPaid"));
    navigate("/profile");
  }

  if (loading) {
    return <div className="p-6 text-center animate-pulse">{t("common.loading")}</div>;
  }

  if (!plan) {
    return <div className="p-6 text-center text-red-500 animate-slideUp opacity-0 animation-delay-100">{t("common.notFound")}</div>;
  }

  return (
    <div className="container py-12 md:py-16 relative">
      <SoftBackground />
      <div className="mx-auto max-w-2xl text-center animate-slideUp opacity-0 animation-delay-100">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          {t("paymentConfirm.title")}
        </h1>
        <p className="mt-3 text-muted-foreground animate-slideUp opacity-0 animation-delay-300">{t("paymentConfirm.desc")}</p>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {/* ✅ Plan Bilgileri */}
        <Card className="md:col-span-2 animate-slideLeft opacity-0 animation-delay-500">
          <CardHeader>
            <CardTitle>{t("paymentConfirm.orderSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div className="flex flex-wrap items-center gap-2 animate-slideUp opacity-0 animation-delay-700">
              <span className="text-foreground font-medium">{t("paymentConfirm.labels.plan")}</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 animate-slideUp opacity-0 animation-delay-800">
              <span className="text-foreground font-medium">{t("paymentConfirm.labels.amount")}</span>
              <span className="text-lg font-semibold text-foreground">${plan.price}</span>
            </div>
            {plan.token_limit ? (
              <div className="flex flex-wrap items-center gap-2 animate-slideUp opacity-0 animation-delay-900">
                <span className="text-foreground font-medium">{t("paymentConfirm.labels.tokens")}</span>
                <Badge variant="outline">{plan.token_limit.toLocaleString()}</Badge>
              </div>
            ) : null}
            {plan.days_valid ? (
              <div className="flex flex-wrap items-center gap-2 animate-slideUp opacity-0 animation-delay-1000">
                <span className="text-foreground font-medium">{t("paymentConfirm.labels.days")}</span>
                <Badge variant="outline">{plan.days_valid} {t("paymentConfirm.labels.daysSuffix")}</Badge>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-xs animate-slideUp opacity-0 animation-delay-1100">
              <Shield className="h-4 w-4 text-primary" /> {t("paymentConfirm.secureLine")}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/80 animate-slideRight opacity-0 animation-delay-600">
          <CardHeader>
            <CardTitle>{t("paymentConfirm.methodTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`cursor-pointer rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] ${method === "iyzico" ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40"} animate-slideUp opacity-0 animation-delay-800`} onClick={() => setMethod("iyzico")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> {t("paymentConfirm.iyzico.name")}</div>
                {method === "iyzico" && <Badge>{t("paymentConfirm.iyzico.selected")}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("paymentConfirm.iyzico.desc")}</p>
            </div>
            <div className={`cursor-pointer rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] ${method === "stripe" ? "border-primary ring-1 ring-primary/40" : "hover:border-primary/40"} animate-slideUp opacity-0 animation-delay-900`} onClick={() => setMethod("stripe")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> {t("paymentConfirm.stripe.name")}</div>
                {method === "stripe" && <Badge>{t("paymentConfirm.stripe.selected")}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("paymentConfirm.stripe.desc")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onay butonları */}
      <div className="mt-6 flex flex-wrap items-center gap-3 animate-slideUp opacity-0 animation-delay-1200">
        <div className="inline-flex items-center gap-2 text-xs">
          <Checkbox id="accept_privacy" checked={accepted} onCheckedChange={(v) => setAccepted(Boolean(v))} />
          <Label htmlFor="accept_privacy" className="cursor-pointer select-none">
            {t("paymentConfirm.acceptPrivacy")}
          </Label>
          <Button variant="link" onClick={() => setPolicyOpen(true)} className="px-1">
            {t("paymentConfirm.privacyLink")}
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button onClick={confirm} disabled={!accepted} className="gap-2 transition-all duration-300 hover:scale-105">
            <ShieldCheck className="h-4 w-4" /> {t("paymentConfirm.confirm")}
          </Button>
          <Button variant="ghost" asChild className="transition-all duration-300 hover:scale-105">
            <Link to="/plans">{t("paymentConfirm.cancel")}</Link>
          </Button>
        </div>
      </div>

      <PrivacyPolicyModal
        open={policyOpen}
        onAccept={() => { localStorage.setItem("nbw_privacy_accepted", "1"); setAccepted(true); setPolicyOpen(false); toast.success(t("paymentConfirm.toastPrivacyAccepted")); }}
        onCancel={() => { setPolicyOpen(false); }}
      />

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

        @keyframes slideLeft {
          from { 
            opacity: 0;
            transform: translateX(-30px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from { 
            opacity: 0;
            transform: translateX(30px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-slideLeft {
          animation: slideLeft 0.6s ease-out forwards;
        }

        .animate-slideRight {
          animation: slideRight 0.6s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 0.1s; animation-fill-mode: both; }
        .animation-delay-300 { animation-delay: 0.3s; animation-fill-mode: both; }
        .animation-delay-500 { animation-delay: 0.5s; animation-fill-mode: both; }
        .animation-delay-600 { animation-delay: 0.6s; animation-fill-mode: both; }
        .animation-delay-700 { animation-delay: 0.7s; animation-fill-mode: both; }
        .animation-delay-800 { animation-delay: 0.8s; animation-fill-mode: both; }
        .animation-delay-900 { animation-delay: 0.9s; animation-fill-mode: both; }
        .animation-delay-1000 { animation-delay: 1.0s; animation-fill-mode: both; }
        .animation-delay-1100 { animation-delay: 1.1s; animation-fill-mode: both; }
        .animation-delay-1200 { animation-delay: 1.2s; animation-fill-mode: both; }
      `}</style>
    </div>
  );
}