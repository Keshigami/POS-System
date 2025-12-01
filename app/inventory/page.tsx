"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Package, Box, X } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
}

interface PackageItem {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
}

interface MealPackage {
    id: string;
    name: string;
    description?: string;
    price: number;
    items: PackageItem[];
}

interface PackageFormItem {
    productId: string;
    quantity: number;
}

export default function InventoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"products" | "packages">("products");

    // Product states
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isProductLoading, setIsProductLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState({
        name: "",
        price: "",
        stock: "",
        categoryId: "",
    });

    // Package states
    const [packages, setPackages] = useState<MealPackage[]>([]);
    const [packageSearchQuery, setPackageSearchQuery] = useState("");
    const [isPackageLoading, setIsPackageLoading] = useState(true);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<MealPackage | null>(null);
    const [packageFormData, setPackageFormData] = useState({
        name: "",
        description: "",
        price: "",
        items: [] as PackageFormItem[],
    });

    useEffect(() => {
        fetchProducts();
        fetchPackages();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);

            const uniqueCats = Array.from(new Set(data.map((p: Product) => JSON.stringify(p.category))))
                .map((s: any) => JSON.parse(s));
            setCategories(uniqueCats);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsProductLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/packages");
            const data = await res.json();
            setPackages(data);
        } catch (error) {
            console.error("Failed to fetch packages", error);
        } finally {
            setIsPackageLoading(false);
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

    const filteredPackages = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(packageSearchQuery.toLowerCase())
    );

    // Product handlers
    const handleOpenProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductFormData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString(),
                categoryId: product.categoryId,
            });
        } else {
            setEditingProduct(null);
            setProductFormData({
                name: "",
                price: "",
                stock: "",
                categoryId: categories[0]?.id || "",
            });
        }
        setIsProductModalOpen(true);
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingProduct
                ? `/api/products/${editingProduct.id}`
                : "/api/products";
            const method = editingProduct ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productFormData),
            });

            if (res.ok) {
                setIsProductModalOpen(false);
                fetchProducts();
            } else {
                alert("Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const handleProductDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchProducts();
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // Package handlers
    const handleOpenPackageModal = (pkg?: MealPackage) => {
        if (pkg) {
            setEditingPackage(pkg);
            setPackageFormData({
                name: pkg.name,
                description: pkg.description || "",
                price: pkg.price.toString(),
                items: pkg.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });
        } else {
            setEditingPackage(null);
            setPackageFormData({
                name: "",
                description: "",
                price: "",
                items: [],
            });
        }
        setIsPackageModalOpen(true);
    };

    const handlePackageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (packageFormData.items.length === 0) {
            alert("Please add at least one product to the package");
            return;
        }

        try {
            const url = editingPackage
                ? `/api/packages/${editingPackage.id}`
                : "/api/packages";
            const method = editingPackage ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(packageFormData),
            });

            if (res.ok) {
                setIsPackageModalOpen(false);
                fetchPackages();
            } else {
                alert("Failed to save package");
            }
        } catch (error) {
            console.error("Error saving package:", error);
        }
    };

    const handlePackageDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;

        try {
            const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPackages();
            } else {
                alert("Failed to delete package");
            }
        } catch (error) {
            console.error("Error deleting package:", error);
        }
    };

    const addPackageItem = () => {
        if (products.length === 0) return;
        setPackageFormData({
            ...packageFormData,
            items: [
                ...packageFormData.items,
                { productId: products[0].id, quantity: 1 },
            ],
        });
    };

    const removePackageItem = (index: number) => {
        setPackageFormData({
            ...packageFormData,
            items: packageFormData.items.filter((_, i) => i !== index),
        });
    };

    const updatePackageItem = (index: number, field: "productId" | "quantity", value: string | number) => {
        const newItems = [...packageFormData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: field === "quantity" ? parseInt(value.toString()) : value,
        };
        setPackageFormData({ ...packageFormData, items: newItems });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push("/")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                            <p className="text-muted-foreground">Manage your products and meal packages</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => activeTab === "products" ? handleOpenProductModal() : handleOpenPackageModal()}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add {activeTab === "products" ? "Product" : "Package"}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === "products"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setActiveTab("products")}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Products
                        </div>
                    </button>
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === "packages"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setActiveTab("packages")}
                    >
                        <div className="flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            Packages
                        </div>
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === "products" && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-8 max-w-sm"
                                    value={productSearchQuery}
                                    onChange={(e) => setProductSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isProductLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No products found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                            {product.category.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>₱{product.price.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <div className={`flex items-center gap-2 ${product.stock < 10 ? "text-red-500 font-bold" : ""}`}>
                                                            <Package className="h-4 w-4" />
                                                            {product.stock}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenProductModal(product)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => handleProductDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Packages Tab */}
                {activeTab === "packages" && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search packages..."
                                    className="pl-8 max-w-sm"
                                    value={packageSearchQuery}
                                    onChange={(e) => setPackageSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isPackageLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredPackages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No packages found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPackages.map((pkg) => (
                                                <TableRow key={pkg.id}>
                                                    <TableCell className="font-medium">{pkg.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{pkg.description || "-"}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {pkg.items.map((item, idx) => (
                                                                <div key={idx}>
                                                                    {item.quantity}x {item.product.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>₱{pkg.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenPackageModal(pkg)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => handlePackageDelete(pkg.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Product Modal */}
                <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={productFormData.name}
                                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₱)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={productFormData.price}
                                        onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={productFormData.stock}
                                        onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={productFormData.categoryId}
                                    onValueChange={(value) => setProductFormData({ ...productFormData, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Product</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Package Modal */}
                <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePackageSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pkgName">Package Name</Label>
                                <Input
                                    id="pkgName"
                                    value={packageFormData.name}
                                    onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pkgDesc">Description</Label>
                                <Input
                                    id="pkgDesc"
                                    value={packageFormData.description}
                                    onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pkgPrice">Price (₱)</Label>
                                <Input
                                    id="pkgPrice"
                                    type="number"
                                    step="0.01"
                                    value={packageFormData.price}
                                    onChange={(e) => setPackageFormData({ ...packageFormData, price: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Package Items */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Package Items</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={addPackageItem}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Item
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {packageFormData.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Select
                                                value={item.productId}
                                                onValueChange={(value) => updatePackageItem(index, "productId", value)}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name} (₱{product.price.toFixed(2)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updatePackageItem(index, "quantity", e.target.value)}
                                                className="w-20"
                                                placeholder="Qty"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => removePackageItem(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {packageFormData.items.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                                            No items added. Click "Add Item" to include products.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsPackageModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Package</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
