"use client";

import { Zap, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product, Package, Category } from "@/types/pos";
import { getProductImage } from "@/lib/product-utils";
import Image from "next/image";

interface ProductGridProps {
    products: Product[] | undefined;
    categories: Category[] | undefined;
    packages: Package[] | undefined;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    searchQuery: string;
    onAddToCart: (product: Product) => void;
    onAddPackageToCart: (pkg: Package) => void;
    isLoading: boolean;
}

export function ProductGrid({
    products,
    categories,
    packages,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    onAddToCart,
    onAddPackageToCart,
    isLoading
}: ProductGridProps) {

    // Derived state for display
    const uniqueCategories = ["All", ...(categories?.map((c) => c.name) || [])];

    // Quick Access (Top 5 available products)
    const popularItems = products ? products.filter(p => p.stock > 0).slice(0, 5) : [];

    // Filter Logic
    const filteredProducts = products?.filter((product) => {
        const matchesCategory = selectedCategory === "All" || product.category.name === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Quick Access Buttons */}
            <div className="p-4 border-b bg-white shadow-sm rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <h3 className="font-semibold text-sm">Quick Access</h3>
                </div>
                {(!products || products.length === 0) && !isLoading ? (
                    <div className="text-xs text-muted-foreground">No products available.</div>
                ) : (
                    <div className="grid grid-cols-5 gap-2">
                        {popularItems.map((product) => (
                            <Button
                                key={product.id}
                                onClick={() => onAddToCart(product)}
                                className="h-16 flex flex-col items-center justify-center gap-1 text-xs hover:scale-105 transition-transform"
                                variant="outline"
                            >
                                <span className="font-semibold truncate w-full text-center">{product.name}</span>
                                <span className="text-primary font-bold">₱{product.price}</span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Meal Packages */}
            {packages && packages.length > 0 && (
                <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <PackageIcon className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold text-sm">Meal Packages</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {packages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className="cursor-pointer hover:shadow-lg transition-all active:scale-95 border-2 border-green-200"
                                onClick={() => onAddPackageToCart(pkg)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <PackageIcon className="h-4 w-4 text-green-600" />
                                        <h4 className="font-bold text-sm">{pkg.name}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{pkg.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-green-600">₱{pkg.price}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {pkg.items.length} items
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="p-4 pb-2 mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide bg-white border rounded-lg">
                <div className="flex gap-2">
                    {uniqueCategories.map((cat) => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            className="rounded-full shadow-sm"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {isLoading || !products ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="animate-pulse">Loading products...</div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20 lg:pb-4">
                    {filteredProducts?.map((product) => (
                        <Card
                            key={product.id}
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 active:scale-95 border-none shadow-md overflow-hidden group"
                            onClick={() => onAddToCart(product)}
                        >
                            <CardContent className="p-0 flex flex-col h-full justify-between">
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                                    <Image
                                        src={getProductImage(product.name, product.category.name)}
                                        alt={product.name}
                                        width={200}
                                        height={150}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {product.stock <= (product.reorderPoint || 10) && (
                                        <span className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm z-10 border border-white/20">
                                            Low Stock
                                        </span>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                                        <h3 className="font-bold text-white text-sm leading-tight shadow-sm text-shadow-sm">{product.name}</h3>
                                    </div>
                                </div>
                                <div className="p-3 bg-white">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-green-700 text-lg">
                                            ₱{product.price.toFixed(2)}
                                        </span>
                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${product.stock <= (product.reorderPoint || 10) ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                            {product.stock} left
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
