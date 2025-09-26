import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProvidersProvider } from '@/contexts/ProvidersContext';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Abapfy - Ferramentas ABAP/ABAP Cloud',
  description: 'Plataforma completa para desenvolvimento ABAP com IA integrada',
  keywords: 'ABAP, ABAP Cloud, SAP, desenvolvimento, programação, debugger, code review',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ProvidersProvider>
            <PageWrapper>{children}</PageWrapper>
          </ProvidersProvider>
        </AuthProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}