import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function PrivacyPolicyModal({ open, onAccept, onCancel }: { open: boolean; onAccept: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className={cn("max-w-lg border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in-0 zoom-in-95")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10"><Lock className="h-4 w-4 text-primary" /></span>
            {t("privacyModal.title")}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t("privacyModal.p1")}</p>
              <p>{t("privacyModal.p2")}</p>
              <p>{t("privacyModal.p3")}</p>
              <p>{t("privacyModal.p4")}</p>
              <p>{t("privacyModal.p5")}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-between gap-2">
          <a href="/privacy" className="text-xs inline-flex items-center gap-1 hover:underline"><FileText className="h-3.5 w-3.5" /> {t("privacyModal.link")}</a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCancel} className="hover:bg-destructive/10 hover:text-destructive">{t("privacyModal.cancel")}</Button>
            <Button onClick={onAccept} className="bg-gradient-to-r from-primary to-fuchsia-500 hover:opacity-90">{t("privacyModal.accept")}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
