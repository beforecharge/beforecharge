import type { AppProps } from "next/app";
import "../src/index.css";
import "../src/pages/Home.css";
import "../src/custom-theme.css";
import "../src/components/SubscriptionWasteQuiz.css";

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
