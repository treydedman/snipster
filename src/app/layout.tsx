import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import { Inter, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snipster - Code Snippet Manager",
  description: "Save, organize, and share code snippets with ease.",
  icons: {
    icon: "/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            richColors
            position="top-center"
            toastOptions={{ duration: 5000 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
