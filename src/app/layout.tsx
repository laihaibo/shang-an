import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "上岸 · 国考学习系统",
    template: "%s · 上岸",
  },
  description:
    "行测刷题、限时模考、错题本、申论课程与面试练习。示例题仅供学习。",
  applicationName: "上岸",
  manifest: "/shang-an/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/shang-an/icon.svg", type: "image/svg+xml" },
      { url: "/shang-an/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/shang-an/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "上岸",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D10" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// 首帧前应用主题与 Splash 门控，避免暗色用户闪白、复访重复播放 Splash
const themeInitScript = `(function(){try{var t=null;try{t=localStorage.getItem("shang-an-theme")}catch(e){}
var d=t==="dark"||((t===null||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var r=document.documentElement;r.classList.toggle("dark",d);
try{if(localStorage.getItem("shang-an-splash-seen")==="1"){r.classList.add("splash-off")}else{localStorage.setItem("shang-an-splash-seen","1")}}catch(e){}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
