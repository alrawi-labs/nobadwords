import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { t } from "i18next";
import { useState } from "react";
import { toast } from "sonner";

interface TempUserData {
  uuid: string;
  tokens: number;
}

export function useTempUser() {
  const [tempUser, setTempUser] = useState<TempUserData | null>(null);

  // Mevcut temp user'ı getir (izin verildikten sonra)
  const fetchTempUser = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/account/temp-user/`, {
        method: "GET", // GET ile mevcut kullanıcıyı getir
        credentials: "include", // cookie gönderilsin
        headers: {
          "X-Device-Fingerprint": fingerprint,
        },
      });

      if (!res.ok) {
        // Eğer kullanıcı yoksa, yeni oluştur
        return await createTempUser();
      }

      const data: TempUserData = await res.json();
      setTempUser(data);
      return data;
    } catch (err) {
      console.error("Fetch temp user error:", err);
      // Hata durumunda yeni kullanıcı oluşturmaya çalış
      return await createTempUser();
    }
  };

  // Yeni temp user oluştur
  // createTempUser içinde
  const createTempUser = async (accepted: boolean = false) => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}/api/account/temp-user/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Fingerprint": fingerprint,
      },
      body: JSON.stringify({ accepted }),
    });

    // JSON’u tek seferde oku
    const data: TempUserData & {
      accepted: boolean;
      detail?: string;
      blocked_until?: string;
    } = await res.json();

    // Hata varsa fırlat
    if (!res.ok) {
      throw {
        detail: data.detail || "Unknown error",
        blocked_until: data.blocked_until || null,
      };
    }

    // Başarılıysa localStorage ve state ayarla
    localStorage.setItem("cookie_consent", "true");
    setTempUser(data);
    return data;
  };

  return { tempUser, fetchTempUser, createTempUser };
}
