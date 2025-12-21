import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "POS System",
    description: "Modern POS System for Philippines",
};

// Inline script to set theme before React hydrates (prevents FOUC and hydration mismatch)
const themeScript = `
(function() {
    try {
        var theme = localStorage.getItem('pos-theme');
        var isDark = theme === 'dark' || 
            (theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
    } catch (e) {}
})();
`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#3b82f6" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="POS System" />
            </head>
            <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`} suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
