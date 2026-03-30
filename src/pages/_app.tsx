import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import AppLayout from '../components/layout/AppLayout';
import '../styles/globals.css';
const NO_LAYOUT_PAGES = ['/auth/login', '/auth/register', '/auth/error'];
export default function App({ Component, pageProps: { session, ...pageProps }, router }: AppProps & { router: any }) {
  const noLayout = NO_LAYOUT_PAGES.includes(router.pathname);
  return (
    <SessionProvider session={session}>
      {noLayout ? <Component {...pageProps} /> : <AppLayout><Component {...pageProps} /></AppLayout>}
    </SessionProvider>
  );
}
