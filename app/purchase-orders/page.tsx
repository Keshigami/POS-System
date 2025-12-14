"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Truck, Check, X, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Supplier {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    costPrice: number;
}

interface POItem {
    productId: string;
    quantity: number;
    costPrice: number;
    productName?: string; // For display
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplier: Supplier;
    status: string; // ORDERED, RECEIVED, CANCELLED
    totalAmount: number;
    createdAt: string;
    items: any[];
}

export default function PurchaseOrdersPage() {
    const { data: purchaseOrders, error } = useSWR<PurchaseOrder[]>("/api/purchase-orders", fetcher);
    const { data: suppliers } = useSWR<Supplier[]>("/api/suppliers", fetcher);
    // Fetch products for the dropdown
    const { data: products } = useSWR<Product[]>("/api/products", fetcher);

    // Search State
    const [search, setSearch] = useState("");

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [poItems, setPoItems] = useState<POItem[]>([]);

    // Add Item State
    const [tempProductId, setTempProductId] = useState("");
    const [tempQty, setTempQty] = useState(1);
    const [tempCost, setTempCost] = useState(0);

    // Default store ID (In a real app, this comes from auth/context)
    // We'll fetch default store or just use the first one from response if needed, 
    // but for creation we need a valid ID. 
    // Ideally we fetch current user's store.
    // For now, let's hardcode fetching a store or assumption.
    // We'll assume the API handles finding a store if missing, OR we fetch one here.
    // Let's rely on API finding the store for now or simplistic fetching.

    // Filter Logic
    const filteredPOs = purchaseOrders?.filter((po) => {
        const s = search.toLowerCase();
        return (
            (po.poNumber?.toLowerCase().includes(s)) ||
            (po.supplier?.name.toLowerCase().includes(s)) ||
            (po.status.toLowerCase().includes(s))
        );
    });

    const addItem = () => {
        if (!tempProductId || tempQty <= 0) return;

        const product = products?.find(p => p.id === tempProductId);
        if (!product) return;

        setPoItems([...poItems, {
            productId: tempProductId,
            quantity: tempQty,
            costPrice: tempCost || product.costPrice,
            productName: product.name
        }]);

        // Reset fields
        setTempProductId("");
        setTempQty(1);
        setTempCost(0);
    };

    const removeItem = (index: number) => {
        const newItems = [...poItems];
        newItems.splice(index, 1);
        setPoItems(newItems);
    };

    const handleCreate = async () => {
        if (!selectedSupplier || poItems.length === 0) {
            alert("Please select a supplier and add items.");
            return;
        }

        // We need a storeId. Let's fetch the first supplier to get their storeId, 
        // OR simpler: we update the API to handle missing storeId by looking up user's store (which we don't have easily in client).
        // Best hack for now: Fetch one supplier and use their storeId, or fetch products and use their storeId.
        // Or assume the API handles it (which I implemented to NOT handle missing storeId).
        // Let's pass a dummy storeId and fix API to be robust, OR better: use the storeId from the supplier object if available.
        // Wait, supplier object in list might have storeId.
        // Let's assume we can get storeId from the supplier.

        // Actually, let's just use the first supplier's storeId from the list if available.
        const supplierObj = suppliers?.find(s => s.id === selectedSupplier);
        const storeId = (supplierObj as any)?.storeId;

        if (!storeId) {
            // Fallback: try to find any store ID from products
            alert("Could not determine Store ID. Please ensure suppliers function correctly.");
            return;
        }

        try {
            const res = await fetch("/api/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierId: selectedSupplier,
                    storeId,
                    items: poItems,
                    notes: "Created via Web UI"
                })
            });

            if (res.ok) {
                mutate("/api/purchase-orders");
                setIsCreateOpen(false);
                setPoItems([]);
                setSelectedSupplier("");
                alert("Order created!");
            } else {
                alert("Failed to create order");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating order");
        }
    };

    const handleReceive = async (isoId: string) => {
        if (!confirm("Receive items? This will increase stock levels.")) return;
        try {
            const res = await fetch(`/api/purchase-orders/${isoId}/receive`, { method: "POST" });
            if (res.ok) {
                mutate("/api/purchase-orders");
                mutate("/api/products"); // Refresh products to see stock update
                alert("Received successfully! Stock updated.");
            } else {
                const data = await res.json();
                alert(`Failed: ${data.error}`);
            }
        } catch (e) {
            alert("Error receiving order");
        }
    };

    if (error) return <div>Failed to load orders</div>;
    if (!purchaseOrders) return <div>Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Truck className="h-8 w-8" />
                    Purchase Orders (Receiving)
                </h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>New Purchase Order</DialogTitle>
                            <DialogDescription>Create a restocking order to a supplier.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Supplier</Label>
                                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers?.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Add Items</h4>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label>Product</Label>
                                        <Select value={tempProductId} onValueChange={(val) => {
                                            setTempProductId(val);
                                            const p = products?.find(prod => prod.id === val);
                                            if (p) setTempCost(p.costPrice);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products?.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <Label>Qty</Label>
                                        <Input type="number" min="1" value={tempQty} onChange={e => setTempQty(parseInt(e.target.value))} />
                                    </div>
                                    <div className="w-24">
                                        <Label>Cost</Label>
                                        <Input type="number" min="0" value={tempCost} onChange={e => setTempCost(parseFloat(e.target.value))} />
                                    </div>
                                    <Button onClick={addItem} variant="secondary">Add</Button>
                                </div>
                            </div>

                            {poItems.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {poItems.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>₱{item.costPrice}</TableCell>
                                                <TableCell>₱{(item.quantity * item.costPrice).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <div className="text-right font-bold text-lg">
                                Total: ₱{poItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0).toFixed(2)}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Order</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search POs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO #</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs?.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell className="font-mono">{po.poNumber}</TableCell>
                                <TableCell>{po.supplier?.name}</TableCell>
                                <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right font-bold">
                                    ₱{po.totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        po.status === "RECEIVED" ? "default" :
                                            po.status === "CANCELLED" ? "destructive" : "secondary"
                                    }>
                                        {po.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {po.status === "ORDERED" && (
                                        <Button size="sm" onClick={() => handleReceive(po.id)} className="gap-2">
                                            <PackageOpen className="h-4 w-4" />
                                            Receive Items
                                        </Button>
                                    )}
                                    {po.status === "RECEIVED" && (
                                        <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                            <Check className="h-3 w-3" /> Received
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
