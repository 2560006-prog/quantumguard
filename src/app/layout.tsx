import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Farmer Verification System',
  description: 'Digital platform for verifying and managing farmer profiles',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#121a13',
              color: '#e8f5e9',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0a0f0d' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0f0d' },
            },
          }}
        />
      </body>
    </html>
  );
}
