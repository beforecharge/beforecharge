import type { AppProps } from "next/app";
import "../src/index.css";

export default function BeforeChargeApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

