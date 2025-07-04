import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { AuthTimeoutWrapper } from "@/components/AuthTimeoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Hub",
  description: "Recipe tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthErrorBoundary>
          <AuthProvider>
            <AuthTimeoutWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <Toaster />
              </ThemeProvider>
            </AuthTimeoutWrapper>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
