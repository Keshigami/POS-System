"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, TrendingUp, Printer } from "lucide-react";

interface ForecastItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    reorderPoint: number;
    leadTime: number;
    avgDailySales: number;
    suggestedReorderPoint: number;
    status: "CRITICAL" | "LOW" | "OK";
    quantityToOrder: number;
}

export function InventoryForecast() {
    const [data, setData] = useState<ForecastItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        try {
            const res = await fetch("/api/analytics/forecast");
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error("Failed to fetch forecast", e);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div>Loading forecast...</div>;

    const criticalItems = data.filter(i => i.status === "CRITICAL");
    const lowItems = data.filter(i => i.status === "LOW");

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Critical Stock</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{criticalItems.length}</div>
                        <p className="text-xs text-red-600/80">Items out of stock</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-yellow-600">Low Stock</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">{lowItems.length}</div>
                        <p className="text-xs text-yellow-600/80">Items below reorder point</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Healthy Stock</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{data.length - criticalItems.length - lowItems.length}</div>
                        <p className="text-xs text-green-600/80">Items sufficient</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Restock Recommendations</CardTitle>
                        <p className="text-sm text-muted-foreground">Based on 30-day sales velocity & lead time</p>
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print Purchase List
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Current Stock</TableHead>
                                    <TableHead className="text-right">Reorder Point</TableHead>
                                    <TableHead className="text-right">Avg Daily Sales</TableHead>
                                    <TableHead className="text-right">Suggested Order</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.id} className={item.status === "CRITICAL" ? "bg-red-50 dark:bg-red-900/10" : item.status === "LOW" ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                            <div className="text-xs text-muted-foreground">{item.category}</div>
                                        </TableCell>
                                        <TableCell>
                                            {item.status === "CRITICAL" && <span className="flex items-center text-red-600 font-bold text-xs uppercase"><AlertCircle className="w-4 h-4 mr-1" /> Critical</span>}
                                            {item.status === "LOW" && <span className="flex items-center text-yellow-600 font-bold text-xs uppercase"><TrendingUp className="w-4 h-4 mr-1" /> Low</span>}
                                            {item.status === "OK" && <span className="flex items-center text-green-600 text-xs uppercase"><CheckCircle className="w-4 h-4 mr-1" /> OK</span>}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{item.currentStock}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            <span className="text-muted-foreground">{item.reorderPoint}</span>
                                            {item.suggestedReorderPoint > item.reorderPoint && (
                                                <div className="text-xs text-blue-600 font-bold" title="Based on recent sales velocity">
                                                    (Rec: {item.suggestedReorderPoint})
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{item.avgDailySales}</TableCell>
                                        <TableCell className="text-right font-bold text-primary font-mono">
                                            {item.quantityToOrder > 0 ? `+${item.quantityToOrder}` : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
