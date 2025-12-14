"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, ShoppingCart, X, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeldOrder {
    id: string;
    total: number;
    discountType: string;
    discountAmount: number;
    paymentMethod: string;
    parkedAt: string;
    parkedBy: string;
    items: Array<{
        id: string;
        productId: string;
        quantity: number;
        price: number;
        product: {
            name: string;
        };
    }>;
}

interface HeldOrdersPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (order: HeldOrder) => void;
    onRefresh: () => void;
}

export function HeldOrdersPanel({ isOpen, onClose, onRestore, onRefresh }: HeldOrdersPanelProps) {
    const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHeldOrders();
        }
    }, [isOpen]);

    const fetchHeldOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders/held");
            if (res.ok) {
                const data = await res.json();
                setHeldOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch held orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (order: HeldOrder) => {
        try {
            const res = await fetch(`/api/orders/held/${order.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                onRestore(order);
                onClose();
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to restore order", error);
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this held order?")) return;

        try {
            const res = await fetch(`/api/orders/held/${orderId}?action=cancel`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchHeldOrders();
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to cancel order", error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes

        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-orange-600" />
                        Held Orders ({heldOrders.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading held orders...
                        </div>
                    ) : heldOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No held orders</p>
                        </div>
                    ) : (
                        heldOrders.map((order) => (
                            <div
                                key={order.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {formatTime(order.parkedAt)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                by {order.parkedBy}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">
                                            ₱{order.total.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCancel(order.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleRestore(order)}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Restore
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.quantity}x {item.product.name}
                                            </span>
                                            <span className="font-mono">
                                                ₱{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {order.discountType !== "NONE" && (
                                    <div className="mt-2 text-xs text-blue-600">
                                        {order.discountType} discount applied (-₱
                                        {order.discountAmount.toFixed(2)})
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
