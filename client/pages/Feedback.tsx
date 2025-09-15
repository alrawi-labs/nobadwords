import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SoftBackground } from "@/components/soft-background";
import { useTranslation } from "react-i18next";

export default function Feedback() {
  const { t } = useTranslation();
  return (
    <div className="container py-10 md:py-14 relative">
      <SoftBackground />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("feedbackPage.title")}</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">{t("feedbackPage.desc")}</p>
      <div className="mt-8 max-w-2xl">
        <Textarea placeholder={t("feedbackPage.placeholder")!} className="min-h-[140px]" />
        <div className="mt-3">
          <Button disabled>{t("feedbackPage.send")}</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("feedbackPage.note")}</p>
      </div>
    </div>
  );
}
