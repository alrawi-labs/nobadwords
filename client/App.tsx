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
import { Sun, Moon, Menu, X, User, ChevronDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {isDark ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
    </button>
  );
};

// Responsive Language Selector Component
const LanguageSelector = ({ className = "" }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  
  const currentLang = (i18n.language || "en").startsWith("en")
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
              : "en";

  const languageNames = {
    en: "English",
    ar: "العربية", 
    tr: "Türkçe",
    es: "Español",
    de: "Deutsch",
    fr: "Français"
  };

  return (
    <div className={className}>
      <Select
        value={currentLang}
        onValueChange={(lng) => {
          i18n.changeLanguage(lng);
          try {
            localStorage.setItem("nbw_i18n_lng", lng);
          } catch {}
        }}
      >
        <SelectTrigger aria-label="Language" className="h-8 w-full sm:h-9 sm:w-[110px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languageNames).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              <span className="sm:hidden">{name}</span>
              <span className="hidden sm:inline">{code.toUpperCase()}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Mobile Navigation Component - artık lg breakpoint'ine kadar görünür
const MobileNavigation = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { tokenCount } = useToken();
  const displayName = user ? `${user.first_name} ${user.last_name}` : null;
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/classify", label: t("nav.classify") },
    { to: "/plans", label: t("nav.plans") },
    { to: "/integration", label: t("nav.integration") },
    { to: "/history", label: t("nav.history") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="xl:hidden p-1 h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img
              src="/logoBad.png"
              alt="NoBadWords Logo"
              className="h-6 w-6 rounded-md"
            />
            NoBadWords
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4 mt-6">
          {/* Token Count - Mobile */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">{t("common.token")}:</span>
            <span className="font-semibold">{tokenCount ?? 0}</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Language Selector - Mobile */}
          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">{t("common.language") || "Language"}</label>
            <LanguageSelector className="w-full" />
          </div>

          {/* User Section - Mobile */}
          <div className="pt-4 border-t">
            {displayName ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
                <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                  <Link to="/profile">{t("common.profile")}</Link>
                </Button>
              </div>
            ) : (
              <Button asChild variant="ghost" className="w-full" onClick={() => setIsOpen(false)}>
                <Link to="/auth">{t("common.login")}</Link>
              </Button>
            )}
          </div>

          {/* CTA Button - Mobile */}
          <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
            <Link to="/classify">{t("common.startAnalysis")}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Desktop User Menu Component
const UserMenu = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const displayName = user ? `${user.first_name} ${user.last_name}` : null;

  if (!displayName) {
    return (
      <Button asChild variant="ghost" className="hidden sm:inline-flex h-8 sm:h-9">
        <Link to="/auth">{t("common.login")}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:inline-flex h-8 sm:h-9 max-w-[150px]">
          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="truncate text-xs sm:text-sm">{displayName}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            {t("common.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/history" className="cursor-pointer">
            {t("nav.history")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/plans" className="cursor-pointer">
            {t("nav.plans")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
          lang: lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast.error(t(data.detail || "verify.sendError"));
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
    `px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  useEffect(() => {
    const pathKey = location.pathname.replace(/^\//, "");
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
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileNavigation />
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logoBad.png"
              alt="NoBadWords Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-md"
            />
            <span className="font-extrabold tracking-tight text-sm sm:text-base">
              <span className="sm:hidden">NBW</span>
              <span className="hidden sm:inline">NoBadWords</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - 1160px breakpoint için xl: kullanıyoruz */}
        <nav className="hidden xl:flex items-center gap-1">
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

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 xl:gap-3">
          {/* Token Count - Desktop/Tablet */}
          <div className="hidden sm:block text-xs xl:text-sm text-muted-foreground">
            {t("common.token")}:{" "}
            <span className="font-semibold text-foreground">
              {tokenCount ?? 0}
            </span>
          </div>

          {/* Language Selector - Desktop */}
          <LanguageSelector className="hidden sm:block" />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Menu */}
          <UserMenu />
          
          {/* CTA Button */}
          <Button asChild size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Link to="/classify">
              <span className="sm:hidden">{t("common.analyze") || "Analyze"}</span>
              <span className="hidden sm:inline">{t("common.startAnalysis")}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Activation Alert */}
      {!activationOk && (
        <div className="border-t">
          <div className="container py-2 px-4">
            <Alert>
              <AlertTitle className="text-sm">{t("common.activateTitle")}</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                <span>{t("common.activateDesc")}</span>
                <Button size="sm" onClick={handleSendEmail} className="self-start sm:self-auto">
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
  const { tokenCount, setTokenCount } = useToken();
  const { i18n } = useTranslation();

  useEffect(() => {
    const storedLang = localStorage.getItem("nbw_i18n_lng");
    if (!storedLang) {
      const langs = navigator.languages || [navigator.language];
      const supported = ["en", "ar", "tr", "es", "de", "fr"];

      const detected =
        langs.find((l) =>
          supported.some((s) => l.toLowerCase().startsWith(s)),
        ) || "en";

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
      <main className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)]">
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
      
      {/* Responsive Footer */}
      <footer className="border-t bg-background">
        <div className="container py-4 sm:py-6 px-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} NoBadWords</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/plans" className="hover:text-foreground">
                {t("common.pricing")}
              </Link>
              <Link to="/about" className="hover:text-foreground">
                {t("nav.about")}
              </Link>
              <Link to="/contact" className="hover:text-foreground">
                {t("nav.contact")}
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                {t("common.privacy") || "Privacy"}
              </Link>
            </div>
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
              <AppContent />
            </TokenProvider>
          </UserProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);