import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SoftBackground } from "@/components/soft-background";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Github,
  Twitter,
  Linkedin,
  Send,
  User,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Sayfa yüklenme animasyonu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const canSend = name.trim() && email.trim() && message.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("nbw_access_token");

      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      const headers: any = {
        "X-Device-Fingerprint": fingerprint,
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      await axios.post(
        `${API_URL}/api/usage/contact/`,
        {
          full_name: name,
          email,
          message,
        },
        {
          withCredentials: true,
          headers,
        },
      );

      toast.success(t("contact.toastSuccess"));
      setName("");
      setEmail("");
      setMessage("");
      setFormSubmitted(true);
      
      // Reset form submitted state after animation
      setTimeout(() => setFormSubmitted(false), 2000);
    } catch (err: any) {
      console.log(err);
      toast.error(t(err?.response?.data?.error) || t(err?.response?.data?.detail) || t("contact.toastError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-12 md:py-16 relative">
      <SoftBackground />
      
      {/* Animated header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {t("contact.title")}
        </h1>
        <p className={`mt-3 text-muted-foreground transition-all duration-800 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t("contact.subtitle")}
        </p>
      </div>

      {/* Main content grid */}
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        
        {/* Contact Form */}
        <Card className={`md:col-span-2 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-lg transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary animate-pulse" />
              {t("contact.form.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              
              {/* Name Input */}
              <div className={`grid gap-1.5 transition-all duration-600 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  {t("contact.form.nameLabel")}
                </Label>
                <Input
                  placeholder={t("contact.form.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md ${formSubmitted ? 'animate-pulse border-green-500' : ''}`}
                />
              </div>
              
              {/* Email Input */}
              <div className={`grid gap-1.5 transition-all duration-600 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  {t("contact.form.emailLabel")}
                </Label>
                <Input
                  type="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md ${formSubmitted ? 'animate-pulse border-green-500' : ''}`}
                />
              </div>
              
              {/* Message Textarea */}
              <div className={`grid gap-1.5 md:col-span-2 transition-all duration-600 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Label className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  {t("contact.form.messageLabel")}
                </Label>
                <Textarea
                  className={`min-h-[140px] transition-all duration-300 focus:scale-[1.01] focus:shadow-md ${formSubmitted ? 'animate-pulse border-green-500' : ''}`}
                  placeholder={t("contact.form.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {/* Submit Button */}
              <div className={`md:col-span-2 transition-all duration-600 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Button 
                  type="submit" 
                  disabled={!canSend || loading}
                  className={`transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${formSubmitted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t("contact.form.send")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card className={`backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-lg transition-all duration-700 delay-500 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary animate-pulse" />
              {t("contact.info.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            
            {/* Contact Details */}
            {[
              { icon: Mail, text: "support@nobadwords.dev", color: "text-blue-500" },
              { icon: Phone, text: "+90 212 000 00 00", color: "text-green-500" },
              { icon: MapPin, text: t("contact.info.address"), color: "text-red-500" },
              { icon: Clock, text: t("contact.info.hours"), color: "text-purple-500" }
            ].map((item, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{transitionDelay: `${700 + index * 100}ms`}}
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
            
            {/* Social Links */}
            <div className={`pt-2 flex items-center gap-3 text-foreground transition-all duration-600 delay-1100 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              {[
                { icon: Twitter, href: "https://twitter.com", name: "Twitter", color: "hover:text-blue-500" },
                { icon: Github, href: "https://github.com", name: "GitHub", color: "hover:text-gray-600" },
                { icon: Linkedin, href: "https://linkedin.com", name: "LinkedIn", color: "hover:text-blue-700" }
              ].map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 transition-all duration-300 hover:scale-110 hover:underline ${social.color}`}
                  style={{transitionDelay: `${1200 + index * 100}ms`}}
                >
                  <social.icon className="h-4 w-4" />
                  {social.name}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support and FAQ Section */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        
        {/* Support Card */}
        <Card className={`md:col-span-1 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-lg transition-all duration-700 delay-1000 hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary animate-pulse" />
              {t("contact.support.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {[
              { label: t("contact.support.tech"), email: "support@nobadwords.dev" },
              { label: t("contact.support.sales"), email: "sales@nobadwords.dev" },
              { label: t("contact.support.privacy"), email: "privacy@nobadwords.dev" }
            ].map((item, index) => (
              <div 
                key={index}
                className={`p-2 rounded hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{transitionDelay: `${1200 + index * 100}ms`}}
              >
                <span className="font-medium">{item.label}:</span>
                <br />
                <a href={`mailto:${item.email}`} className="text-primary hover:underline">
                  {item.email}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* FAQ Card */}
        <Card className={`md:col-span-2 backdrop-blur supports-[backdrop-filter]:bg-card/80 hover:shadow-lg transition-all duration-700 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary animate-pulse" />
              {t("contact.faq.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            {[
              { q: t("contact.faq.q1"), a: t("contact.faq.a1") },
              { q: t("contact.faq.q2"), a: t("contact.faq.a2") },
              { q: t("contact.faq.q3"), a: t("contact.faq.a3") }
            ].map((faq, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border hover:bg-muted/30 transition-all duration-300 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{transitionDelay: `${1400 + index * 150}ms`}}
              >
                <div className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <span className="text-primary">Q:</span>
                  {faq.q}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">A:</span>
                  <span>{faq.a}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}