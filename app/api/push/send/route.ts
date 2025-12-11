import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
    "mailto:fassiliss@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { title, body, url, userIds } = await request.json();

        // Get subscriptions
        let query = supabase.from("push_subscriptions").select("*");

        if (userIds && userIds.length > 0) {
            query = query.in("user_id", userIds);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: "No subscriptions found" });
        }

        // Send to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map((sub) =>
                webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    },
                    JSON.stringify({ title, body, url })
                )
            )
        );

        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({ sent: successful, failed });
    } catch (error) {
        console.error("Send error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}