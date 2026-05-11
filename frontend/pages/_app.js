// Custom App component to include global styles and layout wrappers if needed.

import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}


