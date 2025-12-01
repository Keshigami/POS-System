import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/ai/recommendations";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cartItems } = body;

        if (!Array.isArray(cartItems)) {
            return NextResponse.json(
                { error: "Invalid cart items" },
                { status: 400 }
            );
        }

        const recommendations = await getRecommendations(cartItems);

        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Failed to get recommendations:", error);
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}
