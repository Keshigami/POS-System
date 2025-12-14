"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Supplier {
    id: string;
    name: string;
    contact: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    _count?: {
        products: number;
    };
}

export default function SuppliersPage() {
    const { data: suppliers, error } = useSWR<Supplier[]>("/api/suppliers", fetcher);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        email: "",
        address: "",
        notes: "",
    });

    const filteredSuppliers = suppliers?.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact && s.contact.toLowerCase().includes(search.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingSupplier
                ? `/api/suppliers/${editingSupplier.id}`
                : "/api/suppliers";
            const method = editingSupplier ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save supplier");

            mutate("/api/suppliers");
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            alert("Error saving supplier");
        }
    };

    const handleDelete = async (id: string, productCount: number = 0) => {
        if (productCount > 0) {
            alert("Cannot delete supplier with linked products.");
            return;
        }
        if (!confirm("Are you sure you want to delete this supplier?")) return;

        try {
            const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }
            mutate("/api/suppliers");
        } catch (error: any) {
            alert(error.message);
        }
    };

    const startEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact: supplier.contact || "",
            email: supplier.email || "",
            address: supplier.address || "",
            notes: supplier.notes || "",
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingSupplier(null);
        setFormData({ name: "", contact: "", email: "", address: "", notes: "" });
    };

    if (error) return <div>Failed to load suppliers</div>;
    if (!suppliers) return <div>Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Truck className="h-8 w-8" />
                    Suppliers
                </h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers?.map((supplier) => (
                    <div
                        key={supplier.id}
                        className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{supplier.name}</h3>
                                {supplier.contact && (
                                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(supplier)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(supplier.id, supplier._count?.products)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm">
                            {supplier.email && (
                                <div className="flex gap-2">
                                    <span className="font-medium">Email:</span>
                                    <span>{supplier.email}</span>
                                </div>
                            )}
                            {supplier.address && (
                                <div className="flex gap-2">
                                    <span className="font-medium">Address:</span>
                                    <span>{supplier.address}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <span className="font-medium">Products Linked:</span>
                                <span>{supplier._count?.products || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsModalOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Person/Phone</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
