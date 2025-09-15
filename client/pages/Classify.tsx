import { useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useToken } from "@/context/TokenContext";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  try {
    return localStorage.getItem("nbw_access_token");
  } catch {
    return null;
  }
}

function countTokens(text: string) {
  // Yaklaşık token hesabı: kelime sayısı
  return text.split(/\s+/).filter(Boolean).length;
}

function FeedbackBox({
  input,
  inputId,
  onFeedbackSent,
}: {
  input: string;
  inputId: number;
  onFeedbackSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  async function submit() {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_URL}/api/usage/feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          feedback_text: text.trim(),
          input_id: inputId,
        }),
      });

      if (response.ok) {
        toast.success(t("feedback.toastSuccess"));
        setOpen(false);
        setText("");
        onFeedbackSent();
      } else {
        const errorData = await response.json();
        console.log(errorData);

        if (errorData.ban_end) {
          toast.error(
            t(errorData.error, { ban_end: errorData.ban_end }) ||
              t(errorData.detail, { ban_end: errorData.ban_end }) ||
              t("feedback.toastError"),
          );
        } else {
          toast.error(
            t(errorData.error) ||
              t(errorData.detail) ||
              t("feedback.toastError"),
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(t("feedback.toastError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border p-4">
      {!open ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("feedback.ask")}</p>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t("feedback.send")}
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground">
            {t("feedback.prompt")}
          </p>
          <Textarea
            className="mt-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("feedback.placeholder")}
            disabled={isSubmitting}
          />
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={submit}
              disabled={!text.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  {t("feedback.sending")}
                </>
              ) : (
                t("feedback.send")
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {t("feedback.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Classify() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const { tokenCount, setTokenCount } = useToken();
  const [result, setResult] = useState<{
    predicted_class: 0 | 1;
    toxic_words?: string[];
    toxic_ratio: number;
    tokens: number;
    is_temp: boolean;
    input_id: number;
    used_token: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [canSendFeedback, setCanSendFeedback] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sayfa yüklendiğinde animasyonu başlat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toConsume = result ? result.used_token : 0;
  const remaining = result ? result.tokens : tokenCount;
  const willExceed = toConsume > remaining && toConsume > 0;
  const resultRef = useRef<HTMLDivElement>(null);

  async function analyze() {
    if (!input || willExceed || isAnalyzing) return;

    setIsAnalyzing(true);
    setCanSendFeedback(true); // Yeni analiz için feedback'i tekrar aktif et
    const token = getAuthToken();
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    try {
      const headers: any = {
        "X-Device-Fingerprint": fingerprint,
        "Content-Type": "application/json",
      };

      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/nlp/classify_text/`, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({
          text: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          predicted_class: data.predicted_class,
          toxic_words: data.toxic_words,
          toxic_ratio: data.toxic_ratio,
          used_token: data.used_token,
          tokens: data.tokens,
          is_temp: data.is_temp,
          input_id: data.input_id,
        });
        setTokenCount(data.tokens);
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        console.log(data);
      } else {
        const errorData = await response.json();
        console.log(errorData);
        toast.error(t(errorData.error) || t(errorData.detail) || t("classify.analysisError"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t(error.message));
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleFeedbackSent() {
    setCanSendFeedback(false);
  }

  const progressValue = result
    ? Math.max(0, Math.min(100, ((1000 - result.tokens) / 1000) * 100))
    : 0;

  return (
    <div className="container py-10 md:py-14 relative">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute left-1/2 -top-24 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        <div className={`absolute right-8 top-40 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} />
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Animated title */}
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {t("classify.title")}
        </h1>
        
        {/* Animated description */}
        <p className={`mt-2 text-muted-foreground transition-all duration-800 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t("classify.desc")}
        </p>

        {/* Animated main card */}
        <Card className={`mt-8 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-800 delay-400 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <CardHeader>
            <CardTitle>{t("classify.pasteTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("classify.placeholder")}
              className="min-h-[160px] focus-visible:ring-primary/70 shadow-sm focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-300"
              disabled={isAnalyzing}
              aria-busy={isAnalyzing}
            />
            
            {/* Animated token info */}
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-sm transition-all duration-600 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <div className="text-muted-foreground">
                {t("classify.remainingLabel")}:{" "}
                <span className="font-medium text-foreground">{remaining}</span>{" "}
                token
              </div>
              <div className="text-muted-foreground">
                {t("classify.consume", { n: toConsume })}
              </div>
            </div>
            
            {/* Animated progress bar */}
            <div className={`mt-2 transition-all duration-600 delay-700 ${isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
              <Progress value={progressValue} />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("classify.fields.usage")}</span>
                <span>{remaining} / 1000</span>
              </div>
            </div>
            
            {/* Animated button section */}
            <div className={`mt-4 flex items-center gap-3 transition-all duration-600 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button
                onClick={analyze}
                disabled={!input || willExceed || isAnalyzing}
                className="shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />{" "}
                    {t("classify.analyzing")}
                  </>
                ) : (
                  <>{t("classify.analyze")}</>
                )}
              </Button>
              {willExceed && (
                <span className="text-sm text-destructive animate-pulse">
                  {t("classify.limitExceeded")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results card with enhanced animations */}
        {(isAnalyzing || result) && (
          <Card
            ref={resultRef}
            className="mt-8 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-500 animate-in fade-in-50 slide-in-from-bottom-4"
          >
            <CardHeader>
              <CardTitle>{t("classify.resultTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing && !result ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`rounded-lg border p-4 animate-pulse transition-all duration-500`} style={{animationDelay: `${i * 100}ms`}}>
                        <p className="text-xs text-muted-foreground">
                          {i === 0 && t("classify.fields.predicted_class")}
                          {i === 1 && t("classify.fields.toxic_ratio")}
                          {i === 2 && t("classify.fields.used")}
                          {i === 3 && t("classify.fields.remaining")}
                        </p>
                        <div className={`mt-2 h-7 rounded bg-muted animate-pulse ${i === 0 ? 'w-28' : i === 1 ? 'w-16' : i === 2 ? 'w-16' : 'w-10'}`} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("classify.toxicRatioViz")}
                    </p>
                    <div className="mt-2 h-4 w-full rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              ) : (
                result && (
                  <>
                    {/* Animated result grid */}
                    <div className="grid sm:grid-cols-4 gap-4 text-center">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`rounded-lg border p-4 transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom-2 ${
                            i === 0 
                              ? result.predicted_class
                                ? "bg-red-900 hover:bg-red-600/90"
                                : "bg-green-900 hover:bg-green-600/90"
                              : ""
                          }`}
                          style={{animationDelay: `${i * 100}ms`}}
                        >
                          <p className="text-xs text-muted-foreground">
                            {i === 0 && t("classify.fields.predicted_class")}
                            {i === 1 && t("classify.fields.toxic_ratio")}
                            {i === 2 && t("classify.fields.used")}
                            {i === 3 && t("classify.fields.remaining")}
                          </p>
                          <div className="mt-1">
                            {i === 0 && (
                              result.predicted_class ? (
                                <div className="gap-1 text-white animate-in fade-in-50">
                                  {t("classify.toxic")}
                                </div>
                              ) : (
                                <div className="gap-1 text-white animate-in fade-in-50">
                                  {t("classify.nonToxic")}
                                </div>
                              )
                            )}
                            {i === 1 && (
                              <p className="text-2xl font-bold animate-in zoom-in-50">
                                {result.toxic_ratio}%
                              </p>
                            )}
                            {i === 2 && (
                              <p className="text-2xl font-bold animate-in zoom-in-50">
                                {result.used_token}
                              </p>
                            )}
                            {i === 3 && (
                              <p className="text-2xl font-bold animate-in zoom-in-50">
                                {result.tokens}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Animated progress visualization */}
                    <div className="mt-4 animate-in fade-in-50 slide-in-from-bottom-2" style={{animationDelay: '400ms'}}>
                      <p className="text-sm text-muted-foreground">
                        {t("classify.toxicRatioViz")}
                      </p>
                      <Progress value={result.toxic_ratio} className="mt-2 transition-all duration-1000" />
                    </div>

                    {/* Animated toxic words */}
                    {result.toxic_words && result.toxic_words.length > 0 && (
                      <div className="mt-4 animate-in fade-in-50 slide-in-from-bottom-2" style={{animationDelay: '600ms'}}>
                        <p className="text-sm text-muted-foreground">
                          {t("classify.toxicWords")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.toxic_words.map((word, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="capitalize animate-in zoom-in-50 hover:scale-110 transition-transform"
                              style={{animationDelay: `${700 + index * 50}ms`}}
                            >
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Animated feedback section */}
                    {canSendFeedback && (
                      <div className="animate-in fade-in-50 slide-in-from-bottom-2" style={{animationDelay: '800ms'}}>
                        <FeedbackBox
                          input={input}
                          inputId={result.input_id}
                          onFeedbackSent={handleFeedbackSent}
                        />
                      </div>
                    )}

                    {!canSendFeedback && (
                      <div className="mt-6 rounded-lg border p-4 bg-muted/30 animate-in fade-in-50">
                        <p className="text-sm text-muted-foreground">
                          {t("feedback.toastSuccess")}{" "}
                        </p>
                      </div>
                    )}
                  </>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}