import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '../styles/globals.css';
import '../styles/home.css';
import '../styles/publications.css';
import '../styles/resume.css';
import '../styles/projects.css';
import '../styles/blog.css';
import Navigation from '../components/Navigation';
import { Analytics } from "@vercel/analytics/react"; 
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Timo Krug - Personal Website',
  description: 'Personal website showcasing research, writing, and projects',
  icons: {
    icon: '/sapientia-favicon.svg', // Path relative to the public folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Navigation />
        <main className="page-container">
          {children}
        </main>
        <footer>
          <p>© {new Date().getFullYear()} Timo Krug</p>
          <Analytics />
          <SpeedInsights />
        </footer>
      </body>
    </html>
  );
}