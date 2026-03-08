import dynamic from "next/dynamic";
import Head from "next/head";

// We dynamically import NextApp with ssr as false
// This forces Next.js to render the entire React Router application strictly client-side.
const ClientSPA = dynamic(() => import("../src/NextApp"), {
    ssr: false,
});

export default function AppContainer() {
    return (
        <>
            <Head>
                <title>BeforeCharge — Know Before You Owe</title>
                <meta name="description" content="Take control of your subscription spending. Track, manage, and optimize all your subscription services in one secure dashboard." />
            </Head>
            <ClientSPA />
        </>
    );
}
