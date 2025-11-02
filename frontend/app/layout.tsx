import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amaiko AI Assistant',
  description: 'Enterprise AI Assistant for Microsoft Teams',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
