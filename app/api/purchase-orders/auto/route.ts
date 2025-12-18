import { NextResponse } from "next/server";
import { generateAutoPurchaseOrders } from "@/lib/auto-po";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        // Get default store
        const store = await prisma.store.findFirst();
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 400 });
        }

        const result = await generateAutoPurchaseOrders(store.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Auto PO error:", error);
        return NextResponse.json({ error: "Failed to generate POs" }, { status: 500 });
    }
}
