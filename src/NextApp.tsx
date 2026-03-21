import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { useAuthStore } from "@/store/authStore";
import { autoInitializeDatabase } from "@/lib/initDatabase";

// We want to wrap the entire application in BrowserRouter to let Vite/React Router handle everything just like before.

export default function NextApp() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize the auth store
        useAuthStore.getState().initialize();

        // Initialize database with default data
        autoInitializeDatabase();

        setIsReady(true);
    }, []);

    if (!isReady) return null;

    return (
        <React.StrictMode>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "hsl(var(--background))",
                            color: "hsl(var(--foreground))",
                            border: "1px solid hsl(var(--border))",
                        },
                        success: {
                            iconTheme: {
                                primary: "hsl(var(--primary))",
                                secondary: "hsl(var(--primary-foreground))",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "hsl(var(--destructive))",
                                secondary: "hsl(var(--destructive-foreground))",
                            },
                        },
                    }}
                />
            </BrowserRouter>
        </React.StrictMode>
    );
}
