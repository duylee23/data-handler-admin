// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Data Download Tool Admin',
  description: 'Admin Dashboard for Data Download Tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}