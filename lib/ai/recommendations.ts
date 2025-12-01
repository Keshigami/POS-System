import prisma from "@/lib/prisma";

interface Recommendation {
    productId: string;
    name: string;
    price: number;
    confidence: number; // 0 to 1
    reason: string;
}

export async function getRecommendations(cartProductIds: string[]): Promise<Recommendation[]> {
    if (cartProductIds.length === 0) return [];

    // 1. Fetch recent completed orders (limit to last 1000 for performance)
    const orders = await prisma.order.findMany({
        where: { status: "COMPLETED" },
        take: 1000,
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: { product: true },
            },
        },
    });

    // 2. Build Co-occurrence Matrix
    // Map<ProductId, Map<CoOccurringProductId, Count>>
    const coOccurrence = new Map<string, Map<string, number>>();
    const productCounts = new Map<string, number>();

    for (const order of orders) {
        const items = order.items.map((i) => i.productId);

        // Count individual product occurrences
        for (const id of items) {
            productCounts.set(id, (productCounts.get(id) || 0) + 1);
        }

        // Count pairs
        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < items.length; j++) {
                if (i === j) continue;

                const p1 = items[i];
                const p2 = items[j];

                if (!coOccurrence.has(p1)) {
                    coOccurrence.set(p1, new Map());
                }

                const p1Map = coOccurrence.get(p1)!;
                p1Map.set(p2, (p1Map.get(p2) || 0) + 1);
            }
        }
    }

    // 3. Generate Recommendations based on Cart Items
    const suggestions = new Map<string, Recommendation>();

    for (const cartItemId of cartProductIds) {
        const relatedItems = coOccurrence.get(cartItemId);
        if (!relatedItems) continue;

        const cartItemCount = productCounts.get(cartItemId) || 1;

        for (const [relatedId, count] of Array.from(relatedItems.entries())) {
            // Skip if already in cart
            if (cartProductIds.includes(relatedId)) continue;

            // Calculate Confidence (Conditional Probability: P(B|A) = Count(A&B) / Count(A))
            const confidence = count / cartItemCount;

            // Only suggest if confidence is significant (> 20%)
            if (confidence > 0.2) {
                // If we already have this suggestion from another item, keep the higher confidence
                const existing = suggestions.get(relatedId);
                if (!existing || confidence > existing.confidence) {
                    // We need to fetch product details. 
                    // Optimization: We could fetch all products once, but for now we'll rely on the order data or fetch later.
                    // Let's find the product name/price from the orders we already fetched to avoid extra DB calls
                    const productInfo = orders
                        .flatMap(o => o.items)
                        .find(i => i.productId === relatedId)?.product;

                    if (productInfo) {
                        suggestions.set(relatedId, {
                            productId: relatedId,
                            name: productInfo.name,
                            price: productInfo.price,
                            confidence: confidence,
                            reason: `Frequently bought with items in your cart`,
                        });
                    }
                }
            }
        }
    }

    // 4. Sort by confidence and return top 3
    return Array.from(suggestions.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
}
