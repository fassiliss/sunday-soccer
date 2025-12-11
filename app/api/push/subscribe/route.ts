import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { subscription, userId } = await request.json();

        if (!subscription || !userId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const { endpoint, keys } = subscription;

        const { error } = await supabase.from("push_subscriptions").upsert(
            {
                user_id: userId,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            { onConflict: "user_id,endpoint" }
        );

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscribe error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { endpoint, userId } = await request.json();

        const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("endpoint", endpoint);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}