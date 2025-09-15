import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SoftBackground } from "@/components/soft-background";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function Reset() {
  const { t } = useTranslation();
  const { token } = useParams(); // URL'den token'ı alıyoruz
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);

  // Token kontrolü için useEffect
  useEffect(() => {
    if (!token) {
      toast.error(t("reset.toastInvalidLink"));
      // Token yoksa login sayfasına yönlendir
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    }
  }, [token, t]);

  async function onReset() {
    // Form validasyonları
    if (!token) return toast.error(t("reset.toastInvalidLink"));
    if (!p1 || p1.length < 8) return toast.error("Şifre en az 8 karakter olmalıdır");
    if (!p1 || p1.length > 32) return toast.error("Şifre en fazla 32 karakter olmalıdır");
    if (p1 !== p2) return toast.error(t("reset.toastMismatch"));

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/account/reset_password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: p1,
          confirm_password: p2
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("reset.toastSuccess") || "Şifreniz başarıyla sıfırlandı!");
        // Başarılı olunca login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      } else {
        // Backend'den gelen hata mesajını göster
        const errorMessage = data.error || data.message || t("reset.toastError");
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(t("reset.toastError") || "Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setLoading(false);
    }
  }

  // Token yoksa hiçbir şey render etme
  if (!token) {
    return (
      <div className="container py-10 md:py-16 relative">
        <SoftBackground />
        <div className="mx-auto max-w-lg">
          <Card className="overflow-hidden rounded-2xl shadow-xl">
            <CardContent className="p-6 md:p-8 text-center">
              <p className="text-red-500">Geçersiz veya eksik token!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-16 relative">
      <SoftBackground />
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden rounded-2xl shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-fuchsia-500/20">
            <CardTitle className="text-2xl">{t("reset.title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="grid gap-1.5">
              <Label>{t("reset.newPassLabel")}</Label>
              <Input 
                type="password" 
                value={p1} 
                onChange={(e) => setP1(e.target.value)} 
                placeholder={t("reset.placeholder")!}
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("reset.confirmPassLabel")}</Label>
              <Input 
                type="password" 
                value={p2} 
                onChange={(e) => setP2(e.target.value)} 
                placeholder={t("reset.placeholder")!}
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={onReset}
              disabled={loading || !p1 || !p2}
            >
              {loading ? "Güncelleniyor..." : t("reset.submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}