import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/userContext";
import { Loader2 } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "@/utils/validateLogin";

// Google kimlik doğrulama için global değişken
declare global {
  interface Window {
    google: any;
    handleGoogleResponse: (response: any) => void;
  }
}

// RTL dilleri listesi
const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ku"];

export default function Auth() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const initial = useMemo(
    () => (params.get("view") === "register" ? "register" : "login"),
    [params],
  );
  const [tab, setTab] = useState<string>(initial);
  const { setUser } = useUser();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // RTL kontrolü
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const directionClass = isRTL ? "rtl" : "ltr";
  const textAlignClass = isRTL ? "text-right" : "text-left";

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login
  const [lid, setLid] = useState("");
  const [lpass, setLpass] = useState("");

  // Register
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [firstnameError, setFirstnameError] = useState<string>("");
  const [lastnameError, setLastnameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [emailErrorLogin, setEmailErrorLogin] = useState<string>("");
  const [passwordErrorLogin, setPasswordErrorLogin] = useState<string>("");

  // Initial load animasyonu
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Login fonksiyonu
  async function onLogin() {
    if (!lid || !lpass) {
      toast.error(t("auth.login.toastRequired"));
      return;
    }

    setEmailErrorLogin("");
    setPasswordErrorLogin("");
    setLoginLoading(true);

    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/account/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Fingerprint": fingerprint,
        },
        credentials: "include",
        body: JSON.stringify({
          username: lid,
          password: lpass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.email && data.email[0]) {
          setEmailErrorLogin(`${data.email[0]}`);
        }

        if (data.password && data.password[0]) {
          setPasswordErrorLogin(`${data.password[0]}`);
        }

        if (data.detail) toast.error(t(data.detail));
        else toast.error(t("backend.auth.generalError"));
        return;
      }

      setEmailErrorLogin("");
      setPasswordErrorLogin("");

      localStorage.setItem("nbw_access_token", data.access);

      setUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email_is_activated: data.email_is_activated,
      });

      toast.success(t(data.detail));

      if (data.email_is_activated) location.href = "/profile";
      else location.href = "/activation";
    } catch (err) {
      console.error(err);
      toast.error(t("backend.auth.generalError"));
    } finally {
      setLoginLoading(false);
    }
  }

  // Register fonksiyonu
  async function onRegister() {
    setFirstnameError("");
    setLastnameError("");
    setEmailError("");
    setPasswordError("");

    if (!first || !last || !email || !pass)
      return toast.error(t("auth.register.toastRequired"));

    setRegisterLoading(true);

    const accepted = localStorage.getItem("cookie_consent");

    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const lang = localStorage.getItem("nbw_i18n_lng")
      const res = await fetch(`${API_URL}/api/account/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Fingerprint": fingerprint,
        },
        credentials: "include",
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          email: email,
          password: pass,
          accepted: accepted,
          lang: lang
        }),
      });

      const data = await res.json();
      toast.error(t(data.detail));
      if (!res.ok) {
        if (data.first_name && data.first_name[0]) {
          setFirstnameError(`${data.first_name[0]}`);
        }

        if (data.last_name && data.last_name[0]) {
          setLastnameError(`${data.last_name[0]}`);
        }

        if (data.email && data.email[0]) {
          setEmailError(`${data.email[0]}`);
        }

        if (data.password && data.password[0]) {
          setPasswordError(`${data.password[0]}`);
        }

        return;
      }

      setFirstnameError("");
      setEmailError("");
      setLastnameError("");
      setPasswordError("");
      toast.success(t("auth.register.toastSuccess"));

      setTab("login");
      setLid(email);
      setLpass(pass);
    } catch (err) {
      toast.error(t("backend.auth.generalError"));
      console.error(err);
    } finally {
      setRegisterLoading(false);
    }
  }

  // Enter tuşu dinleyicisi - DÜZELTILMIŞ
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (tab === "login") {
          // Login validasyonu
          if (!lid || !lpass || emailErrorLogin || passwordErrorLogin || loginLoading || googleLoading) {
            return;
          }
          onLogin();
        } else if (tab === "register") {
          // Register validasyonu
          if (!first || !last || !email || !pass || firstnameError || lastnameError || emailError || passwordError || registerLoading || googleLoading) {
            return;
          }
          onRegister();
        }
      }
    },
    [tab, lid, lpass, first, last, email, pass, emailErrorLogin, passwordErrorLogin, firstnameError, lastnameError, emailError, passwordError, loginLoading, registerLoading, googleLoading]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Google Auth initialization
  useEffect(() => {
    // Google API script'ini yükle
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initializeGoogleAuth;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // .env dosyasına ekleyin
        callback: handleGoogleResponse,
      });
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true);

    try {
      // Fingerprint oluştur (mevcut login sisteminizle aynı)
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/account/google-auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Fingerprint": fingerprint, // Fingerprint header ekle
        },
        credentials: "include", // Cookie otomatik gönderilecek
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) toast.error(data.detail);
        else toast.error(t("backend.auth.generalError"));
        return;
      }

      // Access token'ı sakla
      localStorage.setItem("nbw_access_token", data.access);

      // Kullanıcı bilgilerini context'e set et
      setUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email_is_activated: data.email_is_activated,
      });

      toast.success(t("auth.google.success"));

      // Yönlendirme
      if (data.email_is_activated) location.href = "/profile";
      else location.href = "/activation";
    } catch (err) {
      console.error(err);
      toast.error(t("backend.auth.generalError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Global fonksiyon olarak tanımla
  window.handleGoogleResponse = handleGoogleResponse;

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={`relative ${directionClass}`} dir={directionClass}>
      {/* Animated Background */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-fuchsia-500/10 to-background transition-all duration-1000 ${
        isInitialLoad ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`} />
      
      <div className="container py-10 md:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Animated Card */}
          <Card className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-1000 ${
            isInitialLoad ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}>
            {/* Animated Header */}
            <CardHeader className={`bg-gradient-to-r from-primary/20 to-fuchsia-500/20 transition-all duration-700 delay-300 ${
              isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}>
              <CardTitle className={`text-2xl md:text-3xl ${textAlignClass}`}>
                {t("auth.title")}
              </CardTitle>
            </CardHeader>
            
            {/* Animated Content */}
            <CardContent className={`p-6 md:p-8 transition-all duration-700 delay-400 ${
              isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                {/* Animated Tabs List */}
                <TabsList className={`w-full justify-start transition-all duration-500 delay-500 ${
                  isInitialLoad ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  <TabsTrigger
                    value="login"
                    disabled={loginLoading || registerLoading || googleLoading}
                  >
                    {t("auth.tabs.login")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    disabled={loginLoading || registerLoading || googleLoading}
                  >
                    {t("auth.tabs.register")}
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab Content */}
                <TabsContent value="login" className="mt-6 space-y-4">
                  {/* Google Login Button - Animated */}
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className={`w-full transition-all duration-500 delay-600 ${
                      isInitialLoad ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
                    }`}
                    disabled={loginLoading || googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2
                          className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                        />
                        {t("auth.google.loading")}
                      </>
                    ) : (
                      <>
                        <svg
                          className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        {t("auth.google.login") || "Google ile Giriş Yap"}
                      </>
                    )}
                  </Button>

                  {/* Divider - Animated */}
                  <div className={`relative transition-all duration-500 delay-700 ${
                    isInitialLoad ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}>
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("auth.or")}
                      </span>
                    </div>
                  </div>

                  {/* Email Input - Animated */}
                  <div className={`grid gap-1.5 ${textAlignClass} transition-all duration-500 delay-800 ${
                    isInitialLoad ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
                  }`}>
                    <Label className={textAlignClass}>
                      {t("auth.login.idLabel")}
                    </Label>
                    <Input
                      value={lid}
                      onChange={(e) => {
                        setLid(e.target.value);
                        setEmailErrorLogin(validateEmail(e.target.value));
                      }}
                      placeholder={t("auth.login.idPlaceholder")!}
                      disabled={loginLoading || googleLoading}
                      className={textAlignClass}
                      style={{ direction: directionClass }}
                    />
                    {emailErrorLogin && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`backend.auth.${emailErrorLogin}`)}
                      </p>
                    )}
                  </div>

                  {/* Password Input - Animated */}
                  <div className={`grid gap-1.5 ${textAlignClass} transition-all duration-500 delay-900 ${
                    isInitialLoad ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
                  }`}>
                    <Label className={textAlignClass}>
                      {t("auth.login.passLabel")}
                    </Label>
                    <Input
                      type="password"
                      value={lpass}
                      onChange={(e) => {
                        setLpass(e.target.value);
                        setPasswordErrorLogin(validatePassword(e.target.value));
                      }}
                      placeholder={t("auth.login.passPlaceholder")!}
                      disabled={loginLoading || googleLoading}
                      className={textAlignClass}
                      style={{ direction: directionClass }}
                    />
                    {passwordErrorLogin && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`backend.auth.${passwordErrorLogin}`)}
                      </p>
                    )}
                  </div>

                  {/* Login Actions - Animated */}
                  <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""} justify-between transition-all duration-500 delay-1000 ${
                    isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    <Button
                      onClick={onLogin}
                      disabled={loginLoading || googleLoading || !lid || !lpass || !!emailErrorLogin || !!passwordErrorLogin}
                    >
                      {loginLoading ? (
                        <>
                          <Loader2
                            className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                          />
                          {t("auth.login.loading") || "Giriş yapılıyor..."}
                        </>
                      ) : (
                        t("auth.login.submit")
                      )}
                    </Button>
                    <Button
                      variant="link"
                      asChild
                      disabled={loginLoading || googleLoading}
                    >
                      <Link to="/forgot">{t("auth.login.forgot")}</Link>
                    </Button>
                  </div>
                </TabsContent>

                {/* Register Tab Content */}
                <TabsContent value="register" className="mt-6 space-y-4">
                  {/* Google Register Button - Animated */}
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className={`w-full transition-all duration-500 delay-600 ${
                      isInitialLoad ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
                    }`}
                    disabled={registerLoading || googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2
                          className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                        />
                        {t("auth.google.loading") ||
                          "Google ile giriş yapılıyor..."}
                      </>
                    ) : (
                      <>
                        <svg
                          className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        {t("auth.google.register") || "Google ile Kayıt Ol"}
                      </>
                    )}
                  </Button>

                  {/* Divider - Animated */}
                  <div className={`relative transition-all duration-500 delay-700 ${
                    isInitialLoad ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}>
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("auth.or") || "veya"}
                      </span>
                    </div>
                  </div>

                  {/* Name Fields - Animated */}
                  <div className={`grid sm:grid-cols-2 gap-4 transition-all duration-500 delay-800 ${
                    isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    <div className={`grid gap-1.5 ${textAlignClass}`}>
                      <Label className={textAlignClass}>
                        {t("auth.register.firstLabel")}
                      </Label>
                      <Input
                        value={first}
                        onChange={(e) => {
                          setFirst(e.target.value);
                          setFirstnameError(validateFirstName(e.target.value));
                        }}
                        placeholder={t("auth.register.firstPlaceholder")!}
                        disabled={registerLoading || googleLoading}
                        className={textAlignClass}
                        style={{ direction: directionClass }}
                      />
                      {firstnameError && (
                        <p className={`text-red-300 text-sm ${textAlignClass}`}>
                          {t(`backend.auth.${firstnameError}`)}
                        </p>
                      )}
                    </div>
                    <div className={`grid gap-1.5 ${textAlignClass}`}>
                      <Label className={textAlignClass}>
                        {t("auth.register.lastLabel")}
                      </Label>
                      <Input
                        value={last}
                        onChange={(e) => {
                          setLast(e.target.value);
                          setLastnameError(validateLastName(e.target.value));
                        }}
                        placeholder={t("auth.register.lastPlaceholder")!}
                        disabled={registerLoading || googleLoading}
                        className={textAlignClass}
                        style={{ direction: directionClass }}
                      />
                      {lastnameError && (
                        <p className={`text-red-300 text-sm ${textAlignClass}`}>
                          {t(`backend.auth.${lastnameError}`)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field - Animated */}
                  <div className={`grid gap-1.5 ${textAlignClass} transition-all duration-500 delay-900 ${
                    isInitialLoad ? 'opacity-0 translate-x-[20px]' : 'opacity-100 translate-x-0'
                  }`}>
                    <Label className={textAlignClass}>
                      {t("auth.register.emailLabel")}
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(validateEmail(e.target.value));
                      }}
                      placeholder={t("auth.register.emailPlaceholder")!}
                      disabled={registerLoading || googleLoading}
                      className={textAlignClass}
                      style={{ direction: directionClass }}
                    />
                    {emailError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`backend.auth.${emailError}`)}
                      </p>
                    )}
                  </div>

                  {/* Password Field - Animated */}
                  <div className={`grid gap-1.5 ${textAlignClass} transition-all duration-500 delay-1000 ${
                    isInitialLoad ? 'opacity-0 translate-x-[20px]' : 'opacity-100 translate-x-0'
                  }`}>
                    <Label className={textAlignClass}>
                      {t("auth.register.passLabel")}
                    </Label>
                    <Input
                      type="password"
                      value={pass}
                      onChange={(e) => {
                        setPass(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                      }}
                      placeholder={t("auth.register.passPlaceholder")!}
                      disabled={registerLoading || googleLoading}
                      className={textAlignClass}
                      style={{ direction: directionClass }}
                    />
                    {passwordError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`backend.auth.${passwordError}`)}
                      </p>
                    )}
                  </div>

                  {/* Register Button - Animated */}
                  <Button
                    onClick={onRegister}
                    className={`w-full transition-all duration-500 delay-1100 ${
                      isInitialLoad ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                    }`}
                    disabled={
                      registerLoading ||
                      googleLoading ||
                      !first ||
                      !last ||
                      !email ||
                      !pass ||
                      !!firstnameError ||
                      !!lastnameError ||
                      !!emailError ||
                      !!passwordError
                    }
                  >
                    {registerLoading ? (
                      <>
                        <Loader2
                          className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                        />
                        {t("auth.register.loading") || "Kayıt yapılıyor..."}
                      </>
                    ) : (
                      t("auth.register.submit")
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}