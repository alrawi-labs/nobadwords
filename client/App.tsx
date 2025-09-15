import "./global.css";
import "./i18n";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Classify from "./pages/Classify";
import Plans from "./pages/Plans";
import History from "./pages/History";
import Feedback from "./pages/Feedback";
import Auth from "./pages/Auth";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";
import Integration from "./pages/Integration";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PaymentConfirm from "./pages/PaymentConfirm";
import Privacy from "./pages/Privacy";
import VerifyEmail from "./pages/VerifyEmail";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserProvider, useUser } from "./context/userContext";
import { TokenProvider, useToken } from "@/context/TokenContext";
import AccountActivation from "./pages/AccountActivation";
import { toast } from "sonner";
import { useTempUser } from "./hooks/useTempUser";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import CookieConsent from "./components/ui/CookieConsent";

const queryClient = new QueryClient();

type AccessToken = { token: string };

const getAccessToken = async () => {
  const token = localStorage.getItem("nbw_access_token");
  return token;
};

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      aria-label={t("common.themeToggleAria")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

const AppHeader = () => {
  const { tokenCount, setTokenCount } = useToken();
  const { t, i18n } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTokenCount = async () => {
      const token = localStorage.getItem("nbw_access_token");
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      try {
        const headers: any = {
          "X-Device-Fingerprint": fingerprint,
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await axios.get(
          `${API_URL}/api/account/get_token_count/`,
          {
            withCredentials: true,
            headers,
          },
        );
        setTokenCount(response.data.user_token_count);
      } catch (err: any) {
        const error = err.response?.data;
        if (error.detail) {
          if (error.retry_after) {
            toast.error(t(error.detail, { seconds: error.retry_after }));
          } else {
            toast.error(t(error.detail));
          }
        } else {
          toast.error(t("backend.auth.generalError"));
        }
        setTokenCount(0);
      }
    };

    fetchTokenCount();
  }, [setTokenCount, API_URL]);

  const { user } = useUser();
  const location = useLocation();
  const displayName = user ? `${user.first_name} ${user.last_name}` : null;
  const [isSending, setIsSending] = useState(false);
  const [activationOk, setActivationOk] = useState<boolean>(true);
  const navigate = useNavigate();

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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

  useEffect(() => {
    const lang = localStorage.getItem("nbw_i18n_lng");
    const pathKey = location.pathname.replace(/^\//, ""); // baştaki / kaldır
    if (pathKey == "") 
      document.title = `NoBadWords`;
    else
       document.title = `NoBadWords - ${t(`title.${pathKey}`)}`;
  }, [location.pathname, t]);

  useEffect(() => {
    if (
      location.pathname === "/activation" ||
      location.pathname === "/verify-email"
    ) {
      setActivationOk(true);
    } else if (user) {
      setActivationOk(Boolean(user.email_is_activated));
    } else {
      setActivationOk(true);
    }
  }, [location, user]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logoBad.png"
            alt="NoBadWords Logo"
            className="h-8 w-8 rounded-md"
          />
          <span className="font-extrabold tracking-tight">NoBadWords</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/classify" className={navLinkClass}>
            {t("nav.classify")}
          </NavLink>
          <NavLink to="/plans" className={navLinkClass}>
            {t("nav.plans")}
          </NavLink>
          <NavLink to="/integration" className={navLinkClass}>
            {t("nav.integration")}
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            {t("nav.history")}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t("nav.about")}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t("nav.contact")}
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-xs md:text-sm text-muted-foreground">
            {t("common.token")}:{" "}
            <span className="font-semibold text-foreground">
              {tokenCount ?? 0}
            </span>
          </div>
          <div className="hidden sm:block w-[110px]">
            <Select
              value={
                (i18n.language || "en").startsWith("en")
                  ? "en"
                  : (i18n.language || "en").startsWith("ar")
                    ? "ar"
                    : (i18n.language || "en").startsWith("tr")
                      ? "tr"
                      : (i18n.language || "en").startsWith("es")
                        ? "es"
                        : (i18n.language || "en").startsWith("de")
                          ? "de"
                          : (i18n.language || "en").startsWith("fr")
                            ? "fr"
                            : "en"
              }
              onValueChange={(lng) => {
                i18n.changeLanguage(lng);
                try {
                  localStorage.setItem("nbw_i18n_lng", lng);
                } catch {}
              }}
            >
              <SelectTrigger aria-label="Language" className="h-9">
                <SelectValue placeholder="EN/AR/TR/ES/DE/FR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ar">AR</SelectItem>
                <SelectItem value="tr">TR</SelectItem>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="de">DE</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ThemeToggle />
          {displayName ? (
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to="/profile">{displayName}</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">{t("common.login")}</Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/classify">{t("common.startAnalysis")}</Link>
          </Button>
        </div>
      </div>
      {!activationOk && (
        <div className="border-t">
          <div className="container py-2">
            <Alert>
              <AlertTitle>{t("common.activateTitle")}</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>{t("common.activateDesc")}</span>
                <Button size="sm" onClick={handleSendEmail}>
                  {t("common.activateNow")}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </header>
  );
};

// AppContent - TokenProvider içinde çalışacak kısım
const AppContent = () => {
  const { t } = useTranslation();
  const cookie_consent = localStorage.getItem("cookie_consent");
  const [consentGiven, setConsentGiven] = useState(cookie_consent === "true");
  const { tempUser, createTempUser } = useTempUser();
  const { tokenCount, setTokenCount } = useToken(); // Artık Provider içinde
  const { i18n } = useTranslation();

  useEffect(() => {
    // Eğer dil localStorage'da yoksa
    const storedLang = localStorage.getItem("nbw_i18n_lng");
    if (!storedLang) {
      const langs = navigator.languages || [navigator.language];
      const supported = ["en", "ar", "tr", "es", "de", "fr"];

      // Kullanıcının tercih ettiği dillerden ilk destekleneni bul
      const detected =
        langs.find((l) =>
          supported.some((s) => l.toLowerCase().startsWith(s)),
        ) || "en";

      // i18n'e uygula ve localStorage'a yaz
      i18n.changeLanguage(detected);
      localStorage.setItem("nbw_i18n_lng", detected);
    }
  }, [i18n]);

  const fetchTokenCount = async () => {
    const token = localStorage.getItem("nbw_access_token");
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    try {
      const headers: any = {
        "X-Device-Fingerprint": fingerprint,
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${API_URL}/api/account/get_token_count/`,
        {
          withCredentials: true,
          headers,
        },
      );
      setTokenCount(response.data.user_token_count);
    } catch (err: any) {
      if (err.response?.data?.detail) {
        toast.error(t(err.response.data.detail));
      } else {
        toast.error(t("backend.auth.generalError"));
      }
      setTokenCount(0);
    }
  };

  const handleConsentAccept = async () => {
    setConsentGiven(true);

    try {
      await createTempUser(true);
      await fetchTokenCount();
    } catch (error: any) {
      console.log(error);
      if (error.blocked_until) {
        // toast’ı parametre ile kullan
        toast.error(t(error.detail, { blocked_until: error.blocked_until }));
      } else {
        toast.error(t(error.message || "Unknown error"));
      }
    }
  };

  return (
    <BrowserRouter>
      {!consentGiven && <CookieConsent onAccept={handleConsentAccept} />}
      <AppHeader />
      <main className="min-h-[calc(100dvh-4rem)]">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/classify" element={<Classify />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/history" element={<History />} />
          <Route path="/integration" element={<Integration />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset/:token" element={<Reset />} />
          <Route path="/activation" element={<AccountActivation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment/confirm" element={<PaymentConfirm />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t bg-background">
        <div className="container py-6 text-sm text-muted-foreground flex items-center justify-between">
          <p>© {new Date().getFullYear()} NoBadWords</p>
          <div className="flex items-center gap-4">
            <Link to="/plans" className="hover:text-foreground">
              {t("common.pricing")}
            </Link>
            <Link to="/about" className="hover:text-foreground">
              {t("nav.about")}
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              {t("nav.contact")}
            </Link>
            <Link to="/profile" className="hover:text-foreground">
              {t("common.profile")}
            </Link>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  );
};

// Ana App component - Sadece provider'ları wrap eder
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <TokenProvider>
              <AppContent /> {/* Provider içinde çalışır */}
            </TokenProvider>
          </UserProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
