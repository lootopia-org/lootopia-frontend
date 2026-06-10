import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NotificationContainer } from '@/components/NotificationContainer';
import { I18nProvider } from '@/components/I18nProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lootopia - Digital Treasure Hunt',
  description: 'Discover and participate in amazing treasure hunts with AR and geolocation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream">
        <I18nProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <NotificationContainer />
        </I18nProvider>
      </body>
    </html>
  );
}
