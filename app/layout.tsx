import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PWAInstall } from "@/components/pwa-install";
import { SWRegister } from "@/components/sw-register";
import { PopupBlocker } from "@/components/popup-blocker";
import { SilenceConsole } from "@/components/silence-console";
import { AdBlocker } from "@/components/ad-blocker";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F4C81",
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ORYZ - Streaming Sports en Direct",
  description: "Regardez vos sports préférés en direct 24/7 avec ORYZ. Qualité HD, faible latence, expérience premium.",
  manifest: "/manifest.json",
  icons: {
    icon: "/BC181FC3-D658-4C9B-AE48-DFA05D55EBE2.PNG",
    apple: "/BC181FC3-D658-4C9B-AE48-DFA05D55EBE2.PNG",
  },
  // Métadonnées PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ORYZ STREAM",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "ORYZ STREAM",
    "msapplication-TileColor": "#0F4C81",
    "msapplication-config": "/browserconfig.xml",
  },
};

// Police pour le corps de texte
const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

// Police pour les éléments fonctionnels et labels
const montserrat = Montserrat({
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/BC181FC3-D658-4C9B-AE48-DFA05D55EBE2.PNG" />
        <link rel="apple-touch-icon" href="/BC181FC3-D658-4C9B-AE48-DFA05D55EBE2.PNG" />
        <meta name="theme-color" content="#0F4C81" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ORYZ STREAM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('✅ Service Worker enregistré:', registration.scope);
                      // Forcer la mise à jour
                      registration.update();
                    })
                    .catch(function(error) {
                      console.error('❌ Erreur Service Worker:', error);
                    });
                });
              } else {
                console.warn('⚠️ Service Worker non supporté par ce navigateur');
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased dark`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SilenceConsole />
          <PopupBlocker />
          <AdBlocker />
          <SWRegister />
          {children}
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  );
}
