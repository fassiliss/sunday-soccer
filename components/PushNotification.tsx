"use client";

import { useState, useEffect } from "react";

interface PushNotificationProps {
    userId: string;
}

export default function PushNotification({ userId }: PushNotificationProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    }

    async function subscribe() {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });

            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription, userId }),
            });

            setIsSubscribed(true);
        } catch (error) {
            console.error("Subscribe error:", error);
            alert("Failed to enable notifications. Please allow notifications in your browser settings.");
        }
        setLoading(false);
    }

    async function unsubscribe() {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint, userId }),
                });
            }

            setIsSubscribed(false);
        } catch (error) {
            console.error("Unsubscribe error:", error);
        }
        setLoading(false);
    }

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={loading}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isSubscribed
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-green-100 hover:bg-white/20"
            }`}
            title={isSubscribed ? "Notifications enabled" : "Enable notifications"}
        >
            {loading ? (
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
            )}
            <span className="hidden sm:inline">{isSubscribed ? "On" : "Notify"}</span>
        </button>
    );
}