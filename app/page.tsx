"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Search, ShoppingCart, Trash2, Plus, Minus, LogOut, Zap, CreditCard, Wallet, Smartphone, Package as PackageIcon, History, Settings, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "@/components/Receipt";
import { OpenShiftModal } from "@/components/OpenShiftModal";
import { CloseShiftModal } from "@/components/CloseShiftModal";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

interface Package {
    id: string;
    name: string;
    description?: string;
    price: number;
    items: {
        product: Product;
        quantity: number;
    }[];
}

interface CartItem extends Product {
    quantity: number;
    isPackage?: boolean;
}

type DiscountType = "NONE" | "SENIOR_CITIZEN" | "PWD";
type PaymentMethod = "CASH" | "CARD" | "GCASH" | "PAYMAYA";

function SmartSuggestions({ cartItems, onAdd }: { cartItems: CartItem[], onAdd: (product: Product) => void }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);

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
                <div key={item.productId} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{item.name}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-300">Frequently bought together</p>
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

export default function POSPage() {
    const router = useRouter();
    const { data: products } = useSWR<Product[]>("/api/products", fetcher);
    const { data: packages } = useSWR<Package[]>("/api/packages", fetcher);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [discountType, setDiscountType] = useState<DiscountType>("NONE");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [amountPaid, setAmountPaid] = useState<string>("");
    const [showPayment, setShowPayment] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any>(null);

    // Shift management
    const [currentShift, setCurrentShift] = useState<any>(null);
    const [showOpenShift, setShowOpenShift] = useState(false);
    const [showCloseShift, setShowCloseShift] = useState(false);
    const [loadingShift, setLoadingShift] = useState(true);

    // Fetch current shift on mount
    useEffect(() => {
        fetchCurrentShift();
    }, []);

    const fetchCurrentShift = async () => {
        try {
            const res = await fetch("/api/shifts");
            const shift = await res.json();
            setCurrentShift(shift);
            if (!shift) {
                setShowOpenShift(true);
            }
        } catch (error) {
            console.error("Failed to fetch shift", error);
        } finally {
            setLoadingShift(false);
        }
    };

    const categories = ["All", ...Array.from(new Set(products?.map((p) => p.category.name) || []))];
    const popularItems = products?.slice(0, 10) || [];

    const isDigitalPayment = paymentMethod === "GCASH" || paymentMethod === "PAYMAYA";
    const isCashPayment = paymentMethod === "CASH";

    const filteredProducts = products?.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const addPackageToCart = (pkg: Package) => {
        // Add each item from the package
        pkg.items.forEach((item) => {
            for (let i = 0; i < item.quantity; i++) {
                addToCart(item.product);
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter((item) => item.quantity > 0)
        );
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = discountType !== "NONE" ? subtotal * 0.20 : 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountType !== "NONE" ? 0 : discountedSubtotal * 0.12;
    const totalAmount = discountedSubtotal + tax;

    const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - totalAmount) : 0;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!showPayment) {
            setShowPayment(true);
            return;
        }

        // Validate payment reference for digital payments
        if (isDigitalPayment && !paymentReference.trim()) {
            alert(`Please enter ${paymentMethod} transaction reference number`);
            return;
        }

        // Validate amount paid for cash payments
        if (isCashPayment) {
            const paid = parseFloat(amountPaid);
            if (isNaN(paid) || paid < totalAmount) {
                alert("Please enter a valid amount greater than or equal to the total");
                return;
            }
        }

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    total: totalAmount,
                    paymentMethod,
                    paymentReference: isDigitalPayment ? paymentReference : null,
                    amountPaid: isCashPayment ? parseFloat(amountPaid) : null,
                    discountType,
                    discountAmount: discount,
                    userId: null,
                    shiftId: currentShift?.id || null,
                }),
            });

            if (res.ok) {
                const orderData = await res.json();
                setCompletedOrder(orderData);
                setCart([]);
                setDiscountType("NONE");
                setPaymentMethod("CASH");
                setPaymentReference("");
                setAmountPaid("");
                setShowPayment(false);
            } else {
                alert("Failed to process order.");
            }
        } catch (err) {
            alert("Error processing order.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-xl font-bold text-primary">POS System</h1>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-gray-50 dark:bg-gray-900 border-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentShift && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCloseShift(true)}
                                className="text-xs"
                            >
                                <Clock className="h-4 w-4 mr-1" />
                                Close Shift
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")} title="Inventory">
                            <PackageIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} title="Settings">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")} title="History">
                            <History className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/login")} title="Logout">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Quick Access Buttons */}
                <div className="p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <h3 className="font-semibold text-sm">Quick Access</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {popularItems.map((product) => (
                            <Button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="h-16 flex flex-col items-center justify-center gap-1 text-xs hover:scale-105 transition-transform"
                                variant="outline"
                            >
                                <span className="font-semibold truncate w-full text-center">{product.name}</span>
                                <span className="text-primary font-bold">₱{product.price}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Meal Packages */}
                {packages && packages.length > 0 && (
                    <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <PackageIcon className="h-4 w-4 text-green-600" />
                            <h3 className="font-semibold text-sm">Meal Packages</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {packages.map((pkg) => (
                                <Card
                                    key={pkg.id}
                                    className="cursor-pointer hover:shadow-lg transition-all active:scale-95 border-2 border-green-200 dark:border-green-700"
                                    onClick={() => addPackageToCart(pkg)}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <PackageIcon className="h-4 w-4 text-green-600" />
                                            <h4 className="font-bold text-sm">{pkg.name}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{pkg.description}</p>
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
                <div className="p-4 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                className="rounded-full"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <main className="flex-1 p-4 overflow-y-auto">
                    {!products ? (
                        <div className="flex items-center justify-center h-full">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts?.map((product) => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:shadow-lg transition-all active:scale-95 border-none shadow-sm"
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className="p-4 flex flex-col h-full justify-between">
                                        <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-md mb-3 flex items-center justify-center text-4xl">
                                            {product.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                                            <p className="text-primary font-bold">₱{product.price.toFixed(2)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 bg-white dark:bg-gray-800 border-l flex flex-col h-full shadow-xl">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </h2>
                    <span className="text-sm text-muted-foreground">{cart.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <ShoppingCart className="h-12 w-12 mb-2" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">₱{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md border p-1">
                                    <button
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                                    <button
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    <p className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <button
                                    className="text-red-500 hover:text-red-600 p-1"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50 space-y-4">
                    {/* Discount Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Customer Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                size="sm"
                                variant={discountType === "NONE" ? "default" : "outline"}
                                onClick={() => setDiscountType("NONE")}
                                className="text-xs"
                            >
                                Regular
                            </Button>
                            <Button
                                size="sm"
                                variant={discountType === "SENIOR_CITIZEN" ? "default" : "outline"}
                                onClick={() => setDiscountType("SENIOR_CITIZEN")}
                                className="text-xs"
                            >
                                Senior
                            </Button>
                            <Button
                                size="sm"
                                variant={discountType === "PWD" ? "default" : "outline"}
                                onClick={() => setDiscountType("PWD")}
                                className="text-xs"
                            >
                                PWD
                            </Button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    {showPayment && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "CASH" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("CASH")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Wallet className="h-3 w-3" />
                                    Cash
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "CARD" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("CARD")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <CreditCard className="h-3 w-3" />
                                    Card
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "GCASH" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("GCASH")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Smartphone className="h-3 w-3" />
                                    GCash
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "PAYMAYA" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("PAYMAYA")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Smartphone className="h-3 w-3" />
                                    PayMaya
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Cash Payment Input */}
                    {showPayment && isCashPayment && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-green-600 dark:text-green-400">
                                Amount Paid *
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter amount received"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="border-green-300 focus:border-green-500 text-lg font-bold"
                                required
                            />
                            {amountPaid && !isNaN(parseFloat(amountPaid)) && (
                                <div className="flex justify-between text-sm font-medium mt-1">
                                    <span>Change:</span>
                                    <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                                        ₱{change.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Reference for Digital Payments */}
                    {showPayment && isDigitalPayment && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                {paymentMethod} Reference Number *
                            </label>
                            <Input
                                placeholder="Enter transaction/reference ID"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                className="border-orange-300 focus:border-orange-500"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the {paymentMethod} transaction reference for verification
                            </p>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Discount (20%)</span>
                                <span>-₱{discount.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Smart Suggestions (AI) */}
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Smart Suggestions</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <SmartSuggestions cartItems={cart} onAdd={addToCart} />
                            </div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (12%)</span>
                            <span>{tax > 0 ? `₱${tax.toFixed(2)}` : discountType !== "NONE" ? "VAT Exempt" : "₱0.00"}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary">₱{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                    >
                        {showPayment ? `Pay with ${paymentMethod}` : "Checkout"}
                    </Button>

                    {showPayment && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowPayment(false)}
                        >
                            Back
                        </Button>
                    )}
                </div>
            </div>
            {/* Receipt Modal */}
            {completedOrder && (
                <Receipt
                    order={completedOrder}
                    onClose={() => setCompletedOrder(null)}
                />
            )}
            {/* Shift Modals */}
            {!loadingShift && (
                <>
                    <OpenShiftModal
                        isOpen={showOpenShift}
                        onClose={() => setShowOpenShift(false)}
                        onShiftOpened={() => {
                            fetchCurrentShift();
                            setShowOpenShift(false);
                        }}
                        userId="default-user-id"
                        storeId="default-store-id"
                    />
                    {currentShift && (
                        <CloseShiftModal
                            isOpen={showCloseShift}
                            onClose={() => setShowCloseShift(false)}
                            onShiftClosed={() => {
                                setCurrentShift(null);
                                setShowCloseShift(false);
                                setShowOpenShift(true);
                            }}
                            shift={currentShift}
                        />
                    )}
                </>
            )}
        </div>
    );
}
