import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast";
import { getSessionUser } from "@/lib/auth";
import { I18nProvider, type Language } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "SkillSwap Rural — Rural Entrepreneur Skill & Resource Exchange",
    template: "%s · SkillSwap Rural",
  },
  description:
    "Exchange skills, services, and resources without relying on cash. Connect with fellow rural entrepreneurs, discover smart matches, and grow together.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const initialLang = (user?.preferredLanguage as Language) || "en";

  return (
    <html lang={initialLang} className={inter.variable}>
      <body className="min-h-screen bg-stone-50 font-sans text-slate-800 antialiased">
        <I18nProvider initialLanguage={initialLang}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
