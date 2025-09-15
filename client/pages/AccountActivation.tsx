import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Mail,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/userContext";
import axios from "axios";
import { toast } from "sonner";

export default function AccountActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [status, setStatus] = useState("pending"); // pending, success, error, expired
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  async function handleSendEmail() {
    setIsSending(true);
    const token = localStorage.getItem("nbw_access_token");
    if (!token) return;
    const lang = localStorage.getItem("nbw_i18n_lng");

    try {
      const res = await fetch(`${API_URL}/api/account/send_activation_email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lang: lang, // 'tr', 'en', 'ar' vb.
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // ✅ Çok sık istek gönderilmiş, özel işlem yap
          toast.error(t(data.detail || "verify.sendError"));
          // Örn: sayacı başlat veya button'u devre dışı bırak
          console.log(data.remaining_seconds);
          navigate("/verify-email", {
            state: {
              email: data.email,
              minutes: data.remaining_minutes,
              seconds: data.remaining_seconds,
            },
          });
          return;
        } else {
          // Diğer hatalar
          toast.error(t(data.detail || "verify.sendError"));
          return;
        }
      }
      navigate("/verify-email", {
        state: { email: data.email, minutes: data.minutes },
      });
    } catch (err) {
      console.error("Send activation email error:", err);
      toast.error(t("verify.sendError"));
    } finally {
      setIsSending(false);
    }
  }
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1920&auto=format&fit=crop"
            alt="Activation background"
            className="h-full w-full object-cover"
          /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/40 to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-fuchsia-500/15 to-cyan-400/15 blur-3xl" />
      </div>

      <div className="relative container py-20">
        {/* Ana içerik */}
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-background/80 backdrop-blur border">
            <CardHeader className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {t("activation.checkEmailTitle")}
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  {t("activation.checkEmailDesc")}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t("activation.cantFindEmail")}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("activation.checkSpam")}</li>
                  <li>{t("activation.checkEmail")}</li>
                  <li>{t("activation.waitFew")}</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t("activation.sendingEmail")}...
                    </>
                  ) : (
                    `${t("activation.sendEmail")}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  {t("activation.home")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
