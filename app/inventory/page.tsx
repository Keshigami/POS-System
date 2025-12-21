"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Package, Barcode, Layers, Edit, Trash2, ArrowLeft } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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

interface Variant {
    id: string;
    name: string;
    price: number | null;
    stock: number;
    barcode: string | null;
}

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: { name: string };
    categoryId: string;
    barcode: string | null;
    hasVariants: boolean;
    variants: Variant[];
}

export default function InventoryPage() {
    const { data: products, error } = useSWR<Product[]>("/api/products", fetcher);
    const { data: categories } = useSWR<any[]>("/api/categories", fetcher);

    // State
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create/Edit Product State
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [categoryId, setCategoryId] = useState("");
    const [barcode, setBarcode] = useState("");
    const [hasVariants, setHasVariants] = useState(false);

    // Manage Variants Modal
    const [managingVariantId, setManagingVariantId] = useState<string | null>(null);
    const { data: variants } = useSWR<Variant[]>(managingVariantId ? `/api/products/${managingVariantId}/variants` : null, fetcher);
    const [newVariantName, setNewVariantName] = useState("");
    const [newVariantPrice, setNewVariantPrice] = useState("");

    const filteredProducts = products?.filter((p) => {
        const s = search.toLowerCase();
        return (
            (p.name.toLowerCase().includes(s)) ||
            (p.barcode?.toLowerCase().includes(s))
        );
    });

    const resetForm = () => {
        setEditId(null);
        setName("");
        setPrice("");
        setCostPrice("");
        setStock("0");
        setCategoryId("");
        setBarcode("");
        setHasVariants(false);
    };

    const handleCreateProduct = async () => {
        if (!name || !price || !categoryId) {
            alert("Name, Price, and Category are required");
            return;
        }

        try {
            const method = editId ? "PUT" : "POST";
            const url = editId ? `/api/products/${editId}` : "/api/products";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    price,
                    costPrice,
                    stock,
                    categoryId,
                    barcode,
                    hasVariants
                })
            });

            if (res.ok) {
                mutate("/api/products");
                setIsCreateOpen(false);
                resetForm();
                alert(editId ? "Product updated" : "Product created");
            } else {
                alert("Failed to save product");
            }
        } catch (e) {
            alert("Error saving product");
        }
    };

    const handleAddVariant = async () => {
        if (!managingVariantId || !newVariantName) return;

        try {
            const res = await fetch(`/api/products/${managingVariantId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newVariantName,
                    price: newVariantPrice || null,
                    // inherit cost/stock logic or add fields if needed
                })
            });

            if (res.ok) {
                mutate(`/api/products/${managingVariantId}/variants`);
                mutate("/api/products"); // Update main list to show hasVariants true
                setNewVariantName("");
                setNewVariantPrice("");
            }
        } catch (e) {
            alert("Failed to add variant");
        }
    };

    // Stock Adjustment State
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
    const [adjustQty, setAdjustQty] = useState("");
    const [adjustType, setAdjustType] = useState("ADJUSTMENT");
    const [adjustReason, setAdjustReason] = useState("");

    const handleAdjustClick = (product: Product) => {
        setAdjustProduct(product);
        setAdjustQty("");
        setAdjustType("ADJUSTMENT");
        setAdjustReason("");
        setAdjustOpen(true);
    };

    const handleConfirmAdjust = async () => {
        if (!adjustProduct || !adjustQty || !adjustReason) return;

        try {
            const res = await fetch("/api/inventory/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: adjustProduct.id,
                    quantity: parseInt(adjustQty),
                    type: adjustType,
                    reason: adjustReason,
                    userId: "MANUAL_UI" // Placeholder until auth context
                })
            });

            if (res.ok) {
                mutate("/api/products");
                setAdjustOpen(false);
                alert("Stock adjusted successfully");
            } else {
                alert("Failed to adjust stock");
            }
        } catch (e) {
            alert("Error adjusting stock");
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    Inventory Management
                </h1>
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editId ? "Edit Product" : "New Product"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input className="col-span-3" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Price</Label>
                                <Input type="number" className="col-span-3" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Cost</Label>
                                <Input type="number" className="col-span-3" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Barcode</Label>
                                <Input className="col-span-3" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Scan or type..." />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Variants?</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
                                    <span>Product has variants (Size/Color)</span>
                                </div>
                            </div>
                            {!hasVariants && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Stock</Label>
                                    <Input type="number" className="col-span-3" value={stock} onChange={e => setStock(e.target.value)} />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateProduct}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts?.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-mono text-xs">{p.barcode || "-"}</TableCell>
                                <TableCell className="font-medium">
                                    {p.name}
                                    {p.hasVariants && <Badge variant="secondary" className="ml-2 text-xs">Variants</Badge>}
                                </TableCell>
                                <TableCell>{p.category?.name}</TableCell>
                                <TableCell>₱{p.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {p.hasVariants ? (
                                        <span className="text-muted-foreground italic">See variants</span>
                                    ) : (
                                        p.stock
                                    )}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    {!p.hasVariants && (
                                        <Button size="sm" variant="outline" onClick={() => handleAdjustClick(p)}>
                                            <Barcode className="h-4 w-4 mr-1" /> Adjust
                                        </Button>
                                    )}
                                    {p.hasVariants && (
                                        <Button size="sm" variant="outline" onClick={() => setManagingVariantId(p.id)}>
                                            <Layers className="h-4 w-4 mr-1" /> Variants
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Variant Manager Dialog */}
            <Dialog open={!!managingVariantId} onOpenChange={(o) => !o && setManagingVariantId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Variants</DialogTitle>
                        <DialogDescription>Add sizes, colors, or options.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Label>Option Name (e.g. Small)</Label>
                                <Input value={newVariantName} onChange={e => setNewVariantName(e.target.value)} />
                            </div>
                            <div className="w-24">
                                <Label>Price (+)</Label>
                                <Input type="number" placeholder="Optional" value={newVariantPrice} onChange={e => setNewVariantPrice(e.target.value)} />
                            </div>
                            <Button onClick={handleAddVariant}>Add</Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price Override</TableHead>
                                    <TableHead>Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variants?.map(v => (
                                    <TableRow key={v.id}>
                                        <TableCell>{v.name}</TableCell>
                                        <TableCell>{v.price ? `₱${v.price}` : "-"}</TableCell>
                                        <TableCell>{v.stock}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stock Adjustment Dialog */}
            <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            {adjustProduct?.name} (Current: {adjustProduct?.stock})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select value={adjustType} onValueChange={setAdjustType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADJUSTMENT">Adjustment (+/-)</SelectItem>
                                    <SelectItem value="WASTE">Waste (Loss)</SelectItem>
                                    <SelectItem value="RETURN">Return (Restock)</SelectItem>
                                    <SelectItem value="PURCHASE">Direct Purchase</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Quantity</Label>
                            <Input
                                type="number"
                                className="col-span-3"
                                value={adjustQty}
                                onChange={e => setAdjustQty(e.target.value)}
                                placeholder="Positive or Negative"
                            />
                            <span className="text-xs text-muted-foreground col-start-2 col-span-3">
                                For Waste using "5" means -5 stock.
                            </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Reason</Label>
                            <Input
                                className="col-span-3"
                                value={adjustReason}
                                onChange={e => setAdjustReason(e.target.value)}
                                placeholder="e.g. Broken, Expired, Audit"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmAdjust}>Confirm Adjustment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
