import { useState, useEffect } from "react";
import { Cookie, Heart, X, Sparkles, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CookieConsent({ onAccept }: { onAccept?: () => void }) {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 100);

    // Tema kontrolü
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  const handleAccept = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
      onAccept?.();
    }, 300);
  };

  // Helper function to safely get array from translation
  const getTranslationArray = (key: string): any[] => {
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : [];
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main overlay */}
      <div className="fixed inset-0 z-50 pointer-events-auto">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Cookie Banner */}
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md">
          <div
            className={`relative bg-gradient-to-br from-white via-pink-50 to-purple-50 border border-pink-200/50 rounded-3xl shadow-2xl shadow-purple-500/20 backdrop-blur-xl transition-all duration-300 transform ${
              isAnimating
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-full opacity-0 scale-95"
            }`}
          >
            {/* Cute floating elements */}
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="absolute -top-3 left-8">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-md animate-pulse">
                <Sparkles className="w-2 h-2 text-white m-1" />
              </div>
            </div>

            {/* Main content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                    <Cookie className="w-6 h-6 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {t("cookieConsent.title")}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {t("cookieConsent.description")}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {t("cookieConsent.moreInfo")}{" "}
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-purple-600 hover:text-purple-800 underline underline-offset-2 font-medium transition-colors"
                  >
                    {t("cookieConsent.privacyPolicy")}
                  </button>{" "}
                  {t("cookieConsent.moreInfoSuffix")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium text-sm shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Cookie className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  {t("cookieConsent.acceptAll")}
                  <Heart className="w-4 h-4 text-pink-200 animate-pulse" />
                </button>

                <button
                  onClick={handleAccept}
                  className="px-4 py-3 text-gray-900 hover:text-gray-800 font-medium text-sm rounded-2xl hover:bg-pink-300 transition-colors"
                >
                  {t("cookieConsent.essential")}
                </button>
              </div>
            </div>

            {/* Decorative border */}
            <div
              className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 opacity-30 -z-10"
              style={{
                background:
                  "linear-gradient(45deg, transparent, transparent), linear-gradient(45deg, #f472b6, #a855f7, #f472b6)",
                backgroundSize: "100% 100%, 200% 200%",
                backgroundClip: "padding-box, border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-auto">
          {/* Modal backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPrivacyModal(false)}
          />

          {/* Modal content */}
          <div
            className={`relative rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden z-10 transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-900"
            }`}
          >
            {/* Modal header */}
            <div
              className={`sticky top-0 px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-purple-700"
                      : "bg-gradient-to-br from-purple-100 to-pink-100"
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 transition-colors duration-300 ${
                      theme === "dark" ? "text-pink-200" : "text-purple-600"
                    }`}
                  />
                </div>
                <h2
                  className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                    theme === "dark"
                      ? "from-purple-200 to-pink-200"
                      : "from-purple-600 to-pink-600"
                  }`}
                >
                  {t("cookieConsent.privacyModal.title")}
                </h2>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-purple-900 hover:bg-purple-700"
                    : "bg-purple-200 hover:bg-purple-300"
                }`}
              >
                <X
                  className={`w-4 h-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-500"
                  }`}
                />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto">
              <div
                className={`prose prose-sm max-w-none ${
                  theme === "dark" ? "prose-invert" : ""
                }`}
              >
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.intro")}
                </p>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.essential.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.essential.description")}
                </p>
                <ul className="text-sm mb-4 space-y-2 pl-5 list-disc">
                  {getTranslationArray("cookieConsent.privacyModal.essential.items").map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item?.title || ""}</strong> {item?.description || ""}
                    </li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.analytics.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.analytics.description")}
                </p>
                <ul className="text-sm mb-4 space-y-2 pl-5 list-disc">
                  {getTranslationArray("cookieConsent.privacyModal.analytics.items").map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item?.title || ""}</strong> {item?.description || ""}
                    </li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.functional.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.functional.description")}
                </p>
                <ul className="text-sm mb-4 space-y-2 pl-5 list-disc">
                  {getTranslationArray("cookieConsent.privacyModal.functional.items").map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item?.title || ""}</strong> {item?.description || ""}
                    </li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.legal.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.legal.description")}
                </p>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.thirdParty.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.thirdParty.description")}
                </p>

                <h4 className="text-sm font-semibold mb-2">
                  {t("cookieConsent.privacyModal.control.title")}
                </h4>
                <p className="text-sm leading-relaxed mb-4">
                  {t("cookieConsent.privacyModal.control.description")}
                </p>

                <p className="text-gray-500 text-xs leading-relaxed mt-6">
                  {t("cookieConsent.privacyModal.footer")}
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div
              className={`sticky bottom-0 px-6 py-4 space-y-3 border-t transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowPrivacyModal(false);
                    handleAccept();
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors duration-300 border ${
                    theme === "dark"
                      ? "text-gray-100 border-gray-600 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {t("cookieConsent.privacyModal.buttons.essentialOnly")}
                </button>
                <button
                  onClick={() => {
                    setShowPrivacyModal(false);
                    handleAccept();
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-purple-700 text-white hover:bg-purple-800"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                  }`}
                >
                  {t("cookieConsent.privacyModal.buttons.acceptAll")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}