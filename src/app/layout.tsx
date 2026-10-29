import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.adriancosta.com.ar";
const siteTitle = "Adrian Costa — Tech Lead & Software Architect";
const siteDescription =
  "Tech Lead & Software Architect with 25+ years of experience delivering modern full-stack web platforms, React Native mobile apps, and agentic AI systems.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Adrian Costa",
  },
  description: siteDescription,
  keywords: [
    "Adrian Costa",
    "Tech Lead",
    "Software Architect",
    "Full-Stack",
    "TypeScript",
    "Next.js",
    "React",
    "React Native",
    "Agentic AI",
    "MCP Servers",
    "Clean Architecture",
    "Fintech",
  ],
  authors: [{ name: "Adrian Costa", url: siteUrl }],
  creator: "Adrian Costa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "Adrian Costa",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Adrian Costa",
      jobTitle: "Tech Lead & Software Architect",
      description: siteDescription,
      url: siteUrl,
      sameAs: [
        "https://github.com/adricos",
        "https://www.linkedin.com/in/adriancosta",
      ],
      knowsAbout: [
        "Full-Stack Architecture",
        "Next.js",
        "React",
        "React Native",
        "TypeScript",
        "NestJS",
        "Agentic AI Workflows",
        "Model Context Protocol (MCP)",
        "Clean Architecture",
        "Financial Asset Servicing Systems",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Adrian Costa",
      description: siteDescription,
      publisher: {
        "@id": `${siteUrl}/#person`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} font-mono h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100 font-mono">
        {children}
      </body>
    </html>
  );
}
