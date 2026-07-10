import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AppShellWrapper from "@/components/AppShellWrapper";
import WelcomeProvider from "@/components/WelcomeProvider";
import { getSiteContent } from "@/data/content";
import "./globals.css";

const welcomeGuardScript = `(function(){try{if(location.pathname.indexOf('/admin')===0)return;if(sessionStorage.getItem('yn-welcome-shown')!=='true'){document.documentElement.classList.add('yn-welcome-pending');var i=document.createElement('link');i.rel='preload';i.as='image';i.href='/images/re-welcome-background.png';document.head.appendChild(i);}}catch(e){}})();`;

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Home + shell can be cached briefly; admin save calls revalidatePath.
// Seafood detail pages stay force-dynamic for immediate CMS updates.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getSiteContent();

  return {
    title: {
      default: `${siteConfig.brandName} 고객 서비스`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      title: `${siteConfig.brandName} 고객 서비스`,
      description: siteConfig.description,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: welcomeGuardScript }} />
      </head>
      <body className={`${notoSansKr.className} flex min-h-dvh flex-col`}>
        <WelcomeProvider>
          <div id="customer-app" className="flex min-h-dvh flex-1 flex-col">
            <AppShellWrapper>{children}</AppShellWrapper>
          </div>
        </WelcomeProvider>
      </body>
    </html>
  );
}
