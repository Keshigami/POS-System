"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem, Product } from "@/types/pos";

interface SuggestionItem {
    productId: string;
    name: string;
    price: number;
}

interface SmartSuggestionsProps {
    cartItems: CartItem[];
    onAdd: (product: Product) => void;
}

export function SmartSuggestions({ cartItems, onAdd }: SmartSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (cartItems.length === 0) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch("/api/ai/recommendations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItems: cartItems.map(i => i.id) }),
                });
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            }
        };

        // Debounce fetch
        const timeoutId = setTimeout(fetchSuggestions, 500);
        return () => clearTimeout(timeoutId);
    }, [cartItems]);

    if (suggestions.length === 0) return null;

    return (
        <div className="space-y-2">
            {suggestions.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
                    <div>
                        <p className="text-sm font-medium text-purple-900">{item.name}</p>
                        <p className="text-xs text-purple-600">Frequently bought together</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                        onClick={() => onAdd({ id: item.productId, name: item.name, price: item.price } as Product)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        ₱{item.price}
                    </Button>
                </div>
            ))}
        </div>
    );
}
