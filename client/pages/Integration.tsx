import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SoftBackground } from "@/components/soft-background";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Integration() {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("curl");

  // Sayfa yüklendiğinde animasyonu başlat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container py-10 md:py-14 relative">
      <SoftBackground />
      
      {/* Animated header */}
      <h1 className={`text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {t("integration.title")}
      </h1>
      
      <p className={`mt-2 text-muted-foreground max-w-3xl transition-all duration-800 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {t("integration.desc")}
      </p>

      {/* API Basics Card */}
      <Card className={`mt-8 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-400 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            {t("integration.basics.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {[
            { label: t("integration.basics.baseUrl"), value: "https://api.nobadwords.dev" },
            { label: t("integration.basics.endpoint"), value: "POST /classify" },
            { label: t("integration.basics.auth"), value: "Authorization: Bearer YOUR_API_KEY" },
            { label: t("integration.basics.body"), value: `{ "text": "..." }` }
          ].map((item, index) => (
            <div 
              key={index}
              className={`flex flex-wrap items-start gap-2 p-2 rounded hover:bg-muted/50 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
              style={{transitionDelay: `${600 + index * 100}ms`}}
            >
              <span className="font-medium text-foreground min-w-fit">{item.label}:</span> 
              <code className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono break-all">
                {item.value}
              </code>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Examples Card */}
      <Card className={`mt-6 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            {t("integration.examples.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" onValueChange={setActiveTab}>
            <TabsList className={`transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {['curl', 'node', 'python'].map((tab, index) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className={`transition-all duration-300 hover:scale-105 ${activeTab === tab ? 'animate-pulse' : ''}`}
                  style={{transitionDelay: `${900 + index * 100}ms`}}
                >
                  {t(`integration.tabs.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="curl" className={`transition-all duration-500 ${activeTab === 'curl' ? 'animate-in fade-in-50 slide-in-from-right-2' : ''}`}>
              <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs md:text-sm border-l-4 border-l-green-500 hover:bg-muted/80 transition-colors duration-300">
                <code className="text-green-700 dark:text-green-300">
{`curl -X POST https://api.nobadwords.dev/classify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text":"${t("code.exampleText")}"}'`}
                </code>
              </pre>
            </TabsContent>
            
            <TabsContent value="node" className={`transition-all duration-500 ${activeTab === 'node' ? 'animate-in fade-in-50 slide-in-from-right-2' : ''}`}>
              <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs md:text-sm border-l-4 border-l-yellow-500 hover:bg-muted/80 transition-colors duration-300">
                <code className="text-yellow-700 dark:text-yellow-300">
{`const res = await fetch('https://api.nobadwords.dev/classify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: '${t("code.exampleText")}' })
});
const data = await res.json();
console.log(data);`}
                </code>
              </pre>
            </TabsContent>
            
            <TabsContent value="python" className={`transition-all duration-500 ${activeTab === 'python' ? 'animate-in fade-in-50 slide-in-from-right-2' : ''}`}>
              <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs md:text-sm border-l-4 border-l-blue-500 hover:bg-muted/80 transition-colors duration-300">
                <code className="text-blue-700 dark:text-blue-300">
{`import requests

resp = requests.post(
  'https://api.nobadwords.dev/classify',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={'text': '${t("code.exampleText")}' }
)
print(resp.json())`}
                </code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Example Card */}
      <Card className={`mt-6 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-800 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            {t("integration.response.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs md:text-sm border-l-4 border-l-purple-500 hover:bg-muted/80 transition-colors duration-300">
            <code className="text-purple-700 dark:text-purple-300">
{`{
  "predicted_class": 1,
  "toxic_words": ["ornek"],
  "toxic_ratio": 92.0,
  "tokens": 1460,
  "is_temp": false
}`}
            </code>
          </pre>
        </CardContent>
      </Card>

      {/* Bottom Grid - Errors and Security */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Card className={`backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-1000 hover:scale-105 group ${isLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-red-500 transition-colors duration-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              {t("integration.errors.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {[
              t("integration.errors.unauthorized"),
              t("integration.errors.tooMany"),
              t("integration.errors.badRequest")
            ].map((error, index) => (
              <div 
                key={index}
                className={`p-2 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-red-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{transitionDelay: `${1200 + index * 100}ms`}}
              >
                • {error}
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className={`backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-md transition-all duration-700 delay-1200 hover:scale-105 group ${isLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-green-500 transition-colors duration-300">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {t("integration.security.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {[
              t("integration.security.noClientStore"),
              t("integration.security.rotateKeys"),
              t("integration.security.rateLimit")
            ].map((security, index) => (
              <div 
                key={index}
                className={`p-2 rounded hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-green-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{transitionDelay: `${1400 + index * 100}ms`}}
              >
                • {security}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}