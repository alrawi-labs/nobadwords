import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SoftBackground } from "@/components/soft-background";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  // Initial load animasyonu
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const onForgot = async () => {
    if (!email.trim()) {
      toast.error(t("forgot.emailRequired") || "Email is required");
      return;
    }

    setIsLoading(true);
    const lang = localStorage.getItem("nbw_i18n_lng") || "en";
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${API_URL}/api/account/forget_password/`,
        {
          email: email.trim(),
          lang: lang,
        },
      );

      // Başarılı mesaj
      toast.success(
        t("forgot.toastSent") || "Password reset email sent successfully",
      );
      setEmail(""); // Form'u temizle
    } catch (error: any) {
      console.error("Forgot password error:", error);

      const status = error.response?.status;
      const data = error.response?.data;

      if (data?.error) {
        toast.error(data.error);
      } else if (status === 404) {
        toast.error(t("forgot.toastNotFound") || "Email address not found");
      } else if (data?.detail) {
        toast.error(t(data.detail) || "An error occurred. Please try again.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 md:py-16 relative">
      {/* Animated Background */}
      <div className={`transition-all duration-1000 ${
        isInitialLoad ? 'opacity-0' : 'opacity-100'
      }`}>
        <SoftBackground />
      </div>
      
      <div className="mx-auto max-w-lg">
        {/* Animated Card */}
        <Card className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-1000 ${
          isInitialLoad ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}>
          {/* Animated Header */}
          <CardHeader className={`bg-gradient-to-r from-primary/20 to-fuchsia-500/20 transition-all duration-700 delay-300 ${
            isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <CardTitle className="text-2xl">{t("forgot.title")}</CardTitle>
          </CardHeader>
          
          {/* Animated Content */}
          <CardContent className={`p-6 md:p-8 space-y-4 transition-all duration-700 delay-400 ${
            isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            {/* Email Input Field - Animated */}
            <div className={`grid gap-1.5 transition-all duration-500 delay-600 ${
              isInitialLoad ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
            }`}>
              <Label>{t("forgot.emailLabel")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgot.emailPlaceholder")!}
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && onForgot()}
              />
            </div>
            
            {/* Submit Button - Animated */}
            <Button 
              className={`w-full transition-all duration-500 delay-700 ${
                isInitialLoad ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
              }`}
              onClick={onForgot} 
              disabled={isLoading}
            >
              {isLoading
                ? t("common.loading") || "Loading..."
                : t("forgot.submit")}
            </Button>
            
            {/* Back to Login Link - Animated */}
            <p className={`text-xs text-muted-foreground text-center transition-all duration-500 delay-800 ${
              isInitialLoad ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              {t("forgot.backToLogin") || "Remember your password?"}{" "}
              <Link to="/auth" className="underline">
                {t("forgot.loginLink") || "Sign In"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}