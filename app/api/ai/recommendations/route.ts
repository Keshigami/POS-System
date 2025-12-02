import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRecommendations, modelExists } from "@/lib/ml/collaborative-filtering";

export async function POST(request: Request) {
    try {
        const { cartItems } = await request.json();

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json([]);
        }

        // Get current user ID from session (if available)
        const userId = null; // TODO: Extract from session when auth is enabled

        // Try collaborative filtering first if we have a user ID
        if (userId && modelExists()) {
            try {
                const cfRecommendations = await getRecommendations(userId, 3);

                if (cfRecommendations.length > 0) {
                    // Fetch product details
                    const products = await (prisma as any).product.findMany({
                        where: {
                            id: { in: cfRecommendations.map(r => r.productId) },
                            stock: { gt: 0 },
                        },
                    });

                    // Map back with scores
                    const recommendations = products.map((product: any) => {
                        const rec = cfRecommendations.find(r => r.productId === product.id);
                        return {
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            score: rec?.score || 0,
                            reason: 'Personalized for you',
                        };
                    });

                    if (recommendations.length > 0) {
                        console.log('✨ Using collaborative filtering recommendations');
                        return NextResponse.json(recommendations);
                    }
                }
            } catch (error) {
                console.log('CF failed, falling back to rule-based');
            }
        }

        // Fallback: Rule-based recommendations (original logic)
        console.log('📋 Using rule-based recommendations');
        const categoryMap = new Map<string, number>();

        for (const itemId of cartItems) {
            const product = await (prisma as any).product.findUnique({
                where: { id: itemId },
                include: { category: true },
            });

            if (product) {
                const count = categoryMap.get(product.category.name) || 0;
                categoryMap.set(product.category.name, count + 1);
            }
        }

        const dominantCategory = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0];

        if (!dominantCategory) {
            return NextResponse.json([]);
        }

        const products = await (prisma as any).product.findMany({
            where: {
                category: { name: dominantCategory },
                id: { notIn: cartItems },
                stock: { gt: 0 },
            },
            take: 3,
        });

        const recommendations = products.map((product: any) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            score: 0, // No score for rule-based
            reason: `Because you liked ${dominantCategory} items`,
        }));

        return NextResponse.json(recommendations);

    } catch (error) {
        console.error("Failed to get recommendations:", error);
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}

