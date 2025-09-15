import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SoftBackground } from "@/components/soft-background";
import { useTranslation } from "react-i18next";
import { Loader2, Search, Calendar, Filter, RotateCcw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Entry {
  id: string;
  input_text: string;
  predicted_class: 0 | 1;
  toxic_ratio: number;
  tokens_used: number;
  created_at: string;
}

export default function History() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pred, setPred] = useState<string>("all");
  const [ratio, setRatio] = useState("");
  const [onlyWithWords, setOnlyWithWords] = useState(false);
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Sayfa yüklenme animasyonu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("nbw_access_token");

      try {
        setLoading(true);
        setDataLoaded(false);
        const response = await axios.get(`${API_URL}/api/account/history/`, {
          headers: token && { Authorization: `Bearer ${token}` }
        });
        setItems(response.data);
        // Data yüklendikten sonra kısa bir gecikme ile animasyonu başlat
        setTimeout(() => setDataLoaded(true), 200);
      } catch (err:any) {
        if (err.response?.data?.detail) {
          toast.error(t(err.response.data.detail));
        } else {
          toast.error(t("backend.auth.generalError"));
        }
        setItems([]);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [API_URL]);

  const filtered = useMemo(() => {
    const start = from ? new Date(from + "T00:00:00Z").getTime() : -Infinity;
    const end = to ? new Date(to + "T23:59:59Z").getTime() : Infinity;
    const minRatio = ratio ? Number(ratio) : -1;
    return items.filter((e) => {
      const t = new Date(e.created_at).getTime();
      if (t < start || t > end) return false;
      if (pred !== "all" && String(e.predicted_class) !== pred) return false;
      if (minRatio >= 0 && e.toxic_ratio < minRatio) return false;
      if (q && !(`${e.input_text}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [items, q, from, to, pred, ratio, onlyWithWords]);

  const resetFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setPred("all");
    setRatio("");
    setOnlyWithWords(false);
  };

  return (
    <div className="container py-10 md:py-14 relative">
      <SoftBackground />
      
      {/* Animated header */}
      <h1 className={`text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {t("history.title")}
      </h1>
      
      <p className={`mt-2 text-muted-foreground max-w-2xl transition-all duration-800 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {t("history.desc")}
      </p>

      {/* Animated filter panel */}
      <div className={`mt-6 rounded-xl border p-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search Input */}
          <div className={`md:col-span-2 transition-all duration-600 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Label className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              {t("history.searchLabel")}
            </Label>
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder={t("history.searchPlaceholder")}
              className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
            />
          </div>
          
          {/* Start Date */}
          <div className={`transition-all duration-600 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              {t("history.startLabel")}
            </Label>
            <Input 
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
            />
          </div>
          
          {/* End Date */}
          <div className={`transition-all duration-600 delay-800 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              {t("history.endLabel")}
            </Label>
            <Input 
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
            />
          </div>
          
          {/* Prediction Filter */}
          <div className={`transition-all duration-600 delay-900 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              {t("history.predLabel")}
            </Label>
            <Select value={pred} onValueChange={setPred}>
              <SelectTrigger className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <SelectValue placeholder={t("history.selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.predAll")}</SelectItem>
                <SelectItem value="1">{t("history.predToxic")}</SelectItem>
                <SelectItem value="0">{t("history.predNonToxic")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Min Ratio */}
          <div className={`transition-all duration-600 delay-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Label>{t("history.minRatioLabel")}</Label>
            <Input 
              type="number" 
              min={0} 
              max={100} 
              value={ratio} 
              onChange={(e) => setRatio(e.target.value)} 
              placeholder={t("history.minRatioPlaceholder")}
              className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
            />
          </div>
          
          {/* Checkbox */}
          <div className={`flex items-center gap-2 pt-6 transition-all duration-600 delay-1100 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <Checkbox 
              id="words" 
              checked={onlyWithWords} 
              onCheckedChange={(v) => setOnlyWithWords(Boolean(v))}
              className="transition-all duration-300 hover:scale-110"
            />
            <Label htmlFor="words" className="cursor-pointer">
              {t("history.onlyWithWords")}
            </Label>
          </div>
          
          {/* Action Buttons */}
          <div className={`md:col-span-2 flex items-end gap-2 justify-end transition-all duration-600 delay-1200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("history.reset")}
            </Button>
            <Button className="transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
              <Filter className="h-4 w-4 mr-2" />
              {t("history.filter")}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className={`mt-6 rounded-lg border p-6 text-sm text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-500 ${dataLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="animate-pulse">{t("common.loading") || "Loading..."}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`mt-6 rounded-lg border p-6 text-sm text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-500 ${dataLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="text-center">
            <div className="text-4xl mb-2">📝</div>
            {t("history.empty")}
          </div>
        </div>
      ) : (
        <div className={`mt-6 rounded-lg border backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-500 ${dataLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="overflow-x-auto">
            <Table className="text-left">
              <TableHeader>
                <TableRow>
                  {[
                    { key: "date", icon: "📅" },
                    { key: "predicted_class", icon: "🎯" },
                    { key: "toxic_ratio", icon: "📊" },
                    { key: "tokens", icon: "🔢" },
                    { key: "text", icon: "📝" }
                  ].map((col, index) => (
                    <TableHead 
                      key={col.key}
                      className={`transition-all duration-500 ${dataLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{transitionDelay: `${index * 100}ms`}}
                    >
                      <span className="flex items-center gap-2">
                        <span>{col.icon}</span>
                        {t(`history.table.${col.key}`)}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e, index) => (
                  <TableRow 
                    key={e.id || index}
                    className={`hover:bg-muted/50 transition-all duration-300 hover:scale-[1.01] ${dataLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                    style={{transitionDelay: `${500 + index * 50}ms`}}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      <div className="flex flex-col">
                        <span>{new Date(e.created_at).toLocaleDateString()}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(e.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-110 ${
                        e.predicted_class 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      }`}>
                        <span>{e.predicted_class ? "⚠️" : "✅"}</span>
                        {e.predicted_class ? t("classify.toxic").toUpperCase(): t("classify.nonToxic").toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-12 rounded-full bg-muted overflow-hidden`}>
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              e.toxic_ratio > 50 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{
                              width: `${e.toxic_ratio}%`,
                              transitionDelay: `${600 + index * 50}ms`
                            }}
                          />
                        </div>
                        <span className="font-medium">{e.toxic_ratio}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{e.tokens_used}</TableCell>
                    <TableCell className="max-w-xs">
                      <div 
                        className="truncate cursor-help transition-all duration-300 hover:text-primary" 
                        title={e.input_text}
                      >
                        {e.input_text}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}