"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReportsPage() {
    const router = useRouter();
    const { data: inventoryData, error: inventoryError } = useSWR("/api/reports/inventory", fetcher);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Analytics</h1>
                        <p className="text-muted-foreground">Monitor inventory health and store performance.</p>
                    </div>
                </div>

                <Tabs defaultValue="inventory" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="inventory">Inventory Summary</TabsTrigger>
                        <TabsTrigger value="sales" disabled>Sales Performance (Soon)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="inventory" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {inventoryData ? `₱${inventoryData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading..."}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Retail value of all stock
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {inventoryData ? inventoryData.totalItems.toLocaleString() : "Loading..."}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Across all products and variants
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {inventoryData ? inventoryData.lowStockCount : "Loading..."}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Items below reorder point
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Low Stock Items</CardTitle>
                                <CardDescription>
                                    Products that need restocking immediately.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inventoryData?.lowStockItems?.length > 0 ? (
                                    <div className="space-y-4">
                                        {inventoryData.lowStockItems.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600">{item.stock} left</div>
                                                    <p className="text-xs text-muted-foreground">Reorder at: {item.reorderPoint}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No low stock alerts. Inventory counts are healthy.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
