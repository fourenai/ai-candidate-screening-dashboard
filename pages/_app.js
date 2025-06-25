import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

// Global error boundary
import ErrorBoundary from '../components/ErrorBoundary';

// Analytics
import * as gtag from '../lib/gtag';

// Progress bar
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Handle route change events for progress bar
  useEffect(() => {
    const handleStart = (url) => {
      console.log(`Loading: ${url}`);
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // Handle route change for analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (process.env.NODE_ENV === 'production') {
        gtag.pageview(url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Handle errors globally
  useEffect(() => {
    const handleError = (error) => {
      console.error('Global error:', error);
      // You can send this to your error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(error);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason));
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Get layout from page component if defined
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Resume Scoring AI</title>
      </Head>
      
      <ErrorBoundary>
        {getLayout(<Component {...pageProps} />)}
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            // Custom types
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            loading: {
              style: {
                background: '#6366f1',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#6366f1',
              },
            },
          }}
        />
      </ErrorBoundary>
      
      {/* Global styles for NProgress */}
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }
        
        #nprogress .bar {
          background: #3b82f6;
          position: fixed;
          z-index: 1031;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
        }
        
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px #3b82f6, 0 0 5px #3b82f6;
          opacity: 1.0;
          transform: rotate(3deg) translate(0px, -4px);
        }
        
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-break-before {
            page-break-before: always;
          }
          
          .print-break-after {
            page-break-after: always;
          }
          
          .print-avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

export default MyApp;