"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "@/components/Receipt";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Order {
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
    paymentReference?: string;
    discountType: string;
    discountAmount: number;
    items: {
        product: {
            name: string;
        };
        quantity: number;
        price: number;
    }[];
    createdAt: string;
}

export default function TransactionsPage() {
    const router = useRouter();
    const { data: orders } = useSWR<Order[]>("/api/orders", fetcher, {
        refreshInterval: 5000,
    });
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
    const [isRefunding, setIsRefunding] = useState<string | null>(null);

    const handleRefund = async (orderId: string) => {
        if (!confirm("Are you sure you want to refund this order? Stock will be restored.")) return;
        setIsRefunding(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/refund`, { method: "POST" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Refund failed");
            }
            alert("Order refunded successfully. Stock restored.");
            // SWR will refresh automatically
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsRefunding(null);
        }
    };

    const filteredOrders = orders
        ?.filter((order) => {
            const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesPayment = paymentFilter === "ALL" || order.paymentMethod === paymentFilter;
            return matchesSearch && matchesPayment;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalSalesToday = orders
        ?.filter((order) => {
            const orderDate = new Date(order.createdAt).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        })
        .reduce((sum, order) => sum + order.total, 0) || 0;

    const todayOrderCount = orders
        ?.filter((order) => {
            const orderDate = new Date(order.createdAt).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        }).length || 0;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold">Transaction History</h1>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="p-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Today's Sales</p>
                            <p className="text-2xl font-bold text-green-600">₱{totalSalesToday.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Today's Orders</p>
                            <p className="text-2xl font-bold text-blue-600">{todayOrderCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text text-2xl font-bold">{orders?.length || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="mb-4 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order ID or item..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={paymentFilter === "ALL" ? "default" : "outline"}
                            onClick={() => setPaymentFilter("ALL")}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={paymentFilter === "CASH" ? "default" : "outline"}
                            onClick={() => setPaymentFilter("CASH")}
                            size="sm"
                        >
                            Cash
                        </Button>
                        <Button
                            variant={paymentFilter === "GCASH" ? "default" : "outline"}
                            onClick={() => setPaymentFilter("GCASH")}
                            size="sm"
                        >
                            GCash
                        </Button>
                        <Button
                            variant={paymentFilter === "MAYA" ? "default" : "outline"}
                            onClick={() => setPaymentFilter("MAYA")}
                            size="sm"
                        >
                            Maya
                        </Button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                    {!filteredOrders ? (
                        <p className="text-center text-muted-foreground p-8">Loading orders...</p>
                    ) : filteredOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground p-8">No orders found</p>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono text-sm font-medium">
                                                    #{order.id.substring(0, 8).toUpperCase()}
                                                </span>
                                                <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                    {order.paymentMethod}
                                                </span>
                                                {order.discountType !== "NONE" && (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                                        {order.discountType === "SENIOR_CITIZEN" ? "Senior" : "PWD"}
                                                    </span>
                                                )}
                                                {order.status === "REFUNDED" && (
                                                    <span className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                                        REFUNDED
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">
                                                {order.items.map((item, i) => (
                                                    <span key={i}>
                                                        {item.product.name} x{item.quantity}
                                                        {i < order.items.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleString("en-PH", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-primary">₱{order.total.toFixed(2)}</p>
                                            <Button size="sm" variant="outline" className="mt-2" onClick={() => setSelectedOrder(order)}>
                                                View Receipt
                                            </Button>
                                            {order.status !== "REFUNDED" && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="mt-2 ml-2"
                                                    disabled={isRefunding === order.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRefund(order.id);
                                                    }}
                                                >
                                                    {isRefunding === order.id ? "Refunding..." : "Refund"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Receipt Modal */}
            {selectedOrder && (
                <Receipt
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
