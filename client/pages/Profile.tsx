import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Shield,
  User,
  Mail,
  BadgeCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { SoftBackground } from "@/components/soft-background";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/userContext";
import axios from "axios";
import i18n from "@/i18n";

interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
  tokens: number;
  current_plan: string;
}

interface ApiKey {
  token: string;
  created_at: string;
  expires_at: string;
}

interface Subscription {
  plan: string;
  start_date: string;
  is_active: boolean;
  has_payment: boolean;
}

interface Payment {
  plan_name: string;
  amount: number;
  payment_date: string;
  transaction_id: string;
  gateway: String;
  state: String;
}

export default function Profile() {
  // RTL dilleri listesi
  const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ku"];
  // RTL kontrolü
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const directionClass = isRTL ? "rtl" : "ltr";
  const textAlignClass = isRTL ? "text-right" : "text-left";

  const { t } = useTranslation();
  const { user, setUser } = useUser();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [firstnameError, setFirstnameError] = useState<string>("");
  const [lastnameError, setLastnameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordConfirmError, setPasswordConfirmError] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("nbw_access_token");

  // API çağrıları
  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/account/userinfo/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
      }
    } catch (err) {
      console.error("UserInfo fetch error:", err);
    }
  };

  const fetchApiKeys = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/account/get_my_api_keys/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (err) {
      console.error("API Keys fetch error:", err);
    }
  };

  const fetchSubscriptions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/account/get_subscriptions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (err) {
      console.error("Subscriptions fetch error:", err);
    }
  };

  const fetchPayments = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/account/get_payments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Payments fetch error:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserInfo(),
        fetchApiKeys(),
        fetchSubscriptions(),
        fetchPayments(),
      ]);
      setLoading(false);
      // Initial load animasyonunu tetikle
      setTimeout(() => setIsInitialLoad(false), 100);
    };
    loadData();
  }, []);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(t("profile.keys.copied"));
  };

  const logout = async () => {
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      await axios.post(
        `${API_URL}/api/account/logout/`,
        {}, // body boş
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("nbw_access_token")}`,
          },
        },
      );
      toast.success(t("backend.auth.logout.logoutSuccess"));
    } catch (error: any) {
      // Axios hatası varsa backend mesajını al
      if (error.response && error.response.data) {
        const detail =
          error.response.data.detail ||
          error.response.data.details ||
          t("backend.auth.generalError");
        console.error("Logout error detail:", detail);
        toast.error(t(detail));
      } else {
        console.error("Logout API error:", error.message);
        toast.error(t("backend.auth.generalError"));
      }
    } finally {
      // Token ve user state'i temizle
      localStorage.removeItem("nbw_access_token");
      localStorage.removeItem("nbw_refresh_token");
      localStorage.removeItem("nbw_activation_ok");
      setUser(null);
      window.location.href = "/auth";
    }
  };

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFirstnameError("");
    setLastnameError("");
    setPasswordError("");
    setPasswordConfirmError("");
    const fd = new FormData(e.currentTarget);
    const first_name = String(fd.get("first_name") || "").trim();
    const last_name = String(fd.get("last_name") || "").trim();
    const password = String(fd.get("password") || "");
    const confirm_password = String(fd.get("confirm_password") || "");

    if (password && password !== confirm_password) {
      toast.error(t("profile.password.mismatch"));
      return;
    }

    try {
      const updateData: any = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (password) updateData.password = password;
      if (confirm_password) updateData.confirm_password = confirm_password;

      const res = await fetch(`${API_URL}/api/account/update_profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        toast.success(t(data.detail || "profile.updated"));
        setEditing(false);
        await fetchUserInfo();
        if (first_name || last_name) {
          setUser({
            first_name,
            last_name,
            email_is_activated: true,
          });
        }
      } else {
        if (data.first_name && data.first_name[0]) {
          setFirstnameError(`${data.first_name[0]}`);
        }

        if (data.last_name && data.last_name[0]) {
          setLastnameError(`${data.last_name[0]}`);
        }

        if (data.password && data.password[0]) {
          setPasswordError(`${data.password[0]}`);
        }

        if (data.confirm_password && data.confirm_password[0]) {
          setPasswordError(`${data.confirm_password[0]}`);
        }

        toast.error(t("profile.updateError"));
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(t("profile.updateError"));
    }
  };

  if (loading) {
    return (
      <div className="container py-10 md:py-14 relative">
        <SoftBackground />
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container py-10 md:py-14 relative ${directionClass}`} dir={directionClass}>
      <SoftBackground />
      
      {/* Animated Title */}
      <h1 className={`text-3xl md:text-4xl font-bold tracking-tight transition-all duration-1000 ${
        isInitialLoad ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'
      }`}>
        {t("profile.title")}
      </h1>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Kişisel Bilgiler - Animated */}
        <Card className={`lg:col-span-2 transition-all duration-1000 delay-200 ${
          isInitialLoad ? 'opacity-0 translate-x-[-50px]' : 'opacity-100 translate-x-0'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> {t("profile.personal.title")}
            </CardTitle>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                {t("profile.personal.edit")}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Summary banner - Animated */}
            <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-cyan-400/10 p-4 transition-all duration-700 delay-400 ${
              isInitialLoad ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background/80 text-lg font-bold">
                  {(
                    userInfo?.first_name?.[0] ||
                    userInfo?.email?.[0] ||
                    "N"
                  ).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {userInfo?.first_name} {userInfo?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {userInfo?.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            {!editing ? (
              <div className={`mt-4 grid gap-3 sm:grid-cols-2 text-sm transition-all duration-700 delay-500 ${
                isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("profile.labels.first")}
                  </div>
                  <div className="mt-1 font-medium">
                    {userInfo?.first_name || "—"}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("profile.labels.last")}
                  </div>
                  <div className="mt-1 font-medium">
                    {userInfo?.last_name || "—"}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("profile.labels.plan")}
                  </div>
                  <div className="mt-1 font-medium">
                    {typeof userInfo?.current_plan === "object"
                      ? userInfo.current_plan
                      : userInfo?.current_plan || t("profile.plan.freeDemo")}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("profile.labels.remainingTokens")}
                  </div>
                  <div className="mt-1 font-medium">
                    {userInfo?.tokens || 0}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      {t("profile.labels.first")}
                    </div>
                    <Input
                      name="first_name"
                      defaultValue={userInfo?.first_name}
                      className="mt-1"
                    />
                    {firstnameError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`${firstnameError}`)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      {t("profile.labels.last")}
                    </div>
                    <Input
                      name="last_name"
                      defaultValue={userInfo?.last_name}
                      className="mt-1"
                    />
                     {lastnameError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`${lastnameError}`)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-md border p-3 grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("profile.password.new")}
                    </div>
                    <Input type="password" name="password" className="mt-1" />
                     {passwordError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`${passwordError}`)}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("profile.password.confirm")}
                    </div>
                    <Input
                      type="password"
                      name="confirm_password"
                      className="mt-1"
                    />
                     {passwordConfirmError && (
                      <p className={`text-red-300 text-sm ${textAlignClass}`}>
                        {t(`${passwordConfirmError}`)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="submit">
                    <BadgeCheck className="mr-2 h-4 w-4" />{" "}
                    {t("profile.password.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                  >
                    {t("profile.password.cancel")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* API Anahtarları - Animated */}
        <Card className={`lg:col-span-1 transition-all duration-1000 delay-300 ${
          isInitialLoad ? 'opacity-0 translate-x-[50px]' : 'opacity-100 translate-x-0'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> {t("profile.keys.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              {t("profile.keys.info")}
            </div>
            <ul className={`space-y-3 transition-all duration-700 delay-600 ${
              isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}>
              {apiKeys.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  {t("profile.keys.empty")}
                </li>
              )}
              {apiKeys.map((key, index) => (
                <li key={index} className={`rounded-md border p-3 transition-all duration-500 ${
                  isInitialLoad ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                }`} style={{ transitionDelay: `${700 + index * 100}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">
                      {key.token.slice(0, 6)}••••••••••••{key.token.slice(-4)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyKey(key.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(key.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Satın Alınan Planlar - Animated */}
        <Card className={`lg:col-span-3 transition-all duration-1000 delay-400 ${
          isInitialLoad ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
        }`}>
          <CardHeader>
            <CardTitle>{t("profile.purchases.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("profile.purchases.empty")}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((sub, index) => (
                  <div key={index} className={`rounded-md border p-4 transition-all duration-500 ${
                    isInitialLoad ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`} style={{ transitionDelay: `${800 + index * 150}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{sub.plan["name"]}</div>
                      <div className="flex gap-1">
                        {sub.is_active ? (
                          <Badge className="bg-green-600 text-white hover:bg-green-600/90">
                            <CheckCircle2 className="h-3 w-3 mx-1" />
                            {t("plans.active")}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white hover:bg-green-600/90">
                            <CheckCircle2 className="h-3 w-3 mx-1" />
                            {t("plans.inactive")}
                          </Badge>
                        )}
                        {sub.has_payment ? (
                          <Badge variant="secondary">{t("plans.paid")}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("plans.unpaid")}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started: {new Date(sub.start_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ödeme Geçmişi - Animated */}
        <Card className={`lg:col-span-3 transition-all duration-1000 delay-500 ${
          isInitialLoad ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
        }`}>
          <CardHeader>
            <CardTitle>{t("profile.payments.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("profile.payments.empty")}
              </div>
            ) : (
              <div className="grid gap-3">
                {payments.map((p, i) => {
                  const state = (p.state || "").toLowerCase();
                  console.log(state);
                  const stateBadge =
                    state === "paid" ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-600/90 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                        {t("profile.payments.state.paid")}
                      </Badge>
                    ) : state === "refunded" ? (
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />{" "}
                        {t("profile.payments.state.refunded")}
                      </Badge>
                    ) : state === "pending" ? (
                      <Badge className="bg-yellow-500 text-white hover:bg-yellow-500/90 inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />{" "}
                        {t("profile.payments.state.pending")}
                      </Badge>
                    ) : state === "canceled" ? (
                      <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5 text-gray-500" />{" "}
                        {t("profile.payments.state.canceled")}
                      </Badge>
                    ) : state === "failed" ? (
                      <Badge
                        variant="destructive"
                        className="inline-flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />{" "}
                        {t("profile.payments.state.failed")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{state}</Badge>
                    );
                  const gw = (p.gateway || "").toUpperCase();
                  const when = p.payment_date
                    ? new Date(p.payment_date).toLocaleString()
                    : "";
                  return (
                    <div
                      key={(p.transaction_id || "tx") + i}
                      className={`relative rounded-2xl border p-[1px] bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-cyan-400/20 transition-all duration-600 ${
                        isInitialLoad ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                      }`}
                      style={{ transitionDelay: `${900 + i * 200}ms` }}
                    >
                      <div className="rounded-2xl bg-background/80 backdrop-blur p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {gw} {t("profile.payments.paymentWord")}{" "}
                                {p.transaction_id}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {when}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stateBadge}
                          </div>
                        </div>
                        <div className="mt-3 grid sm:grid-cols-4 gap-2 text-sm">
                          <div className="rounded-md border p-2">
                            <div className="text-xs text-muted-foreground">
                              {t("profile.payments.labels.user")}
                            </div>
                            <div className="mt-0.5 font-medium">
                              {userInfo.email ?? t("profile.payments.unknown")}
                            </div>
                          </div>
                          <div className="rounded-md border p-2">
                            <div className="text-xs text-muted-foreground">
                              {t("profile.payments.labels.plan")}
                            </div>
                            <div className="mt-0.5 font-medium">
                              {p.plan_name ?? "—"}
                            </div>
                          </div>
                          <div className="rounded-md border p-2">
                            <div className="text-xs text-muted-foreground">
                              {t("profile.payments.labels.amount")}
                            </div>
                            <div className="mt-0.5 font-medium">
                              $
                              {p.amount?.toFixed
                                ? p.amount.toFixed(2)
                                : p.amount}
                            </div>
                          </div>
                          <div className="rounded-md border p-2 flex items-center justify-between">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                {t("profile.payments.labels.txnId")}
                              </div>
                              <div
                                className="mt-0.5 font-medium truncate max-w-[160px]"
                                title={p.transaction_id}
                              >
                                {p.transaction_id}
                              </div>
                            </div>
                            <button
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  p.transaction_id || "",
                                );
                                toast.success(t("profile.payments.copyToast"));
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />{" "}
                              {t("profile.payments.copy")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout Button - Animated */}
        <div className={`lg:col-span-3 flex justify-end transition-all duration-1000 delay-700 ${
          isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <Button variant="outline" size="sm" onClick={logout}>
            {t("profile.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}