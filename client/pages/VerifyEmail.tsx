import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { SoftBackground } from "@/components/soft-background";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { dataTagErrorSymbol } from "@tanstack/react-query";

function ConfettiCanvas({ run }: { run: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!run) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      ctx.scale(DPR, DPR);
    }
    const colors = [
      "#8b5cf6",
      "#06b6d4",
      "#22c55e",
      "#eab308",
      "#f97316",
      "#ef4444",
      "#10b981",
    ];
    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      rot: number;
      vr: number;
      c: string;
      w: number;
      h: number;
      life: number;
    };
    let parts: P[] = [];
    function burst() {
      const { width, height } = canvas.getBoundingClientRect();
      const cx = width / 2,
        cy = height / 2;
      parts = Array.from({ length: 180 }).map(() => {
        const a = Math.random() * Math.PI * 2;
        const s = 4 + Math.random() * 7;
        return {
          x: cx,
          y: cy,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 2,
          r: 0,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.2,
          c: colors[Math.floor(Math.random() * colors.length)],
          w: 4 + Math.random() * 4,
          h: 8 + Math.random() * 8,
          life: 0,
        };
      });
    }
    function tick() {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const p of parts) {
        p.vy += 0.12; // gravity
        p.vx *= 0.995; // drag
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life += 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - p.life / 240);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }
    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    resize();
    burst();
    tick();
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [run]);
  return <canvas ref={ref} className="absolute inset-0 -z-10 h-full w-full" />;
}

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  const [celebrate, setCelebrate] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const emailFromState = location.state?.email || "";
  const minutesFromState = location.state?.minutes || 5;
  const secondsFromState = location.state?.seconds || 0;
  const [email, setEmail] = useState<string>(emailFromState);
  const [minutes, setMinutes] = useState<number>(minutesFromState);
  const [seconds, setSeconds] = useState<number>(secondsFromState);
  const [resendLoading, setResendLoading] = useState<boolean>(true);

  useEffect(() => {
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [emailFromState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval); // sayaç bittiğinde durdur
          setResendLoading(false)
        }
      }
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [minutes, seconds]);

  async function sendActivationEmail() {
    const token = localStorage.getItem("nbw_access_token");
    if (!token) return;
    const lang = localStorage.getItem("nbw_i18n_lng");

    try {
      const API_URL = import.meta.env.VITE_API_URL;

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
        toast.error(t(data.detail));
        return;
      }
      setResendLoading(true)
      setMinutes(5);
      setSeconds(0);
      setEmail(data.email);
      toast.success(t(data.detail));
    } catch (err) {
      console.error("Send activation email error:", err);
      toast.error(t(err.detail));
    }
  }

  // Email aktivasyonunu doğrula
  async function onSubmit() {
    if (!code || code.length !== 6) {
      toast.error(t("verify.invalid"));
      return;
    }

    const token = localStorage.getItem("nbw_access_token");
    if (!token) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/account/activate_email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(t(data.detail));
        return;
      }

      toast.success(t("verify.success"));
      setCelebrate(true);
    } catch (err) {
      console.error("Activate email error:", err);
      toast.error(t("verify.invalid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-10 md:py-14 relative">
      <SoftBackground />
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden rounded-2xl shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-fuchsia-500/20">
            <CardTitle className="text-2xl">{t("verify.title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("verify.desc", { email: email })}
            </p>
            <div className="grid gap-1.5">
              <Label>{t("verify.codeLabel")}</Label>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                containerClassName="mt-1"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onSubmit}
                disabled={code.length !== 6 || loading}
              >
                {loading ? t("common.loading") : t("verify.submit")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={sendActivationEmail}
                disabled={resendLoading}
              >
                {t("verify.resend")}
              </Button>
              <p className="text-sm text-muted-foreground">
                {" "}
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {celebrate && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-background/70 backdrop-blur" />
          <ConfettiCanvas run={celebrate} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              className="relative w-full max-w-md"
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/40 via-fuchsia-500/30 to-cyan-400/30 blur-xl" />
              <Card className="relative rounded-3xl overflow-hidden text-center">
                <CardContent className="pt-8 pb-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="mx-auto h-20 w-20"
                  >
                    <div className="relative h-full w-full">
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: -18, rotate: -10 }}
                        transition={{
                          delay: 0.35,
                          type: "spring",
                          stiffness: 180,
                          damping: 14,
                        }}
                        className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 origin-bottom rounded-md bg-primary"
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-primary to-fuchsia-500" />
                      <div className="absolute inset-x-[44%] top-0 bottom-0 bg-white/90" />
                      <div className="absolute inset-y-[44%] left-0 right-0 bg-white/90" />
                    </div>
                  </motion.div>
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                  >
                    {t("verify.congratsTitle")}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-sm text-muted-foreground"
                  >
                    {t("verify.congratsDesc")}
                  </motion.p>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                  >
                    <Button
                      size="lg"
                      onClick={() => (window.location.href = "/profile")}
                      className="gap-2"
                    >
                      {t("verify.continue")}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
