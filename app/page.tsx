"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useSWR from "swr";
import {
    Search,
    ShoppingCart,
    Trash2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt } from "@/components/Receipt";
import { OpenShiftModal } from "@/components/OpenShiftModal";
import { CloseShiftModal } from "@/components/CloseShiftModal";
import { HeldOrdersPanel } from "@/components/HeldOrdersPanel";
import { NumpadModal } from "@/components/numpad-modal";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Refactored Components
import { POSHeader } from "@/components/pos/POSHeader";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartSidebar } from "@/components/pos/CartSidebar";
import { PaymentInterface } from "@/components/pos/PaymentInterface";
import { NavigationSidebar } from "@/components/pos/NavigationSidebar";

// Types
import { Product, Category, Package, CartItem, DiscountType, PaymentMethod, Customer } from "@/types/pos";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function POSPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Load quote from URL if present
    useEffect(() => {
        const loadQuoteId = searchParams.get("loadQuote");
        if (loadQuoteId) {
            const fetchQuote = async () => {
                try {
                    const res = await fetch(`/ api / quotes / ${loadQuoteId} `);
                    if (res.ok) {
                        const quote = await res.json();
                        // Transform quote items to cart items
                        const cartItems = quote.items.map((item: any) => ({
                            id: item.productId,
                            name: item.product.name,
                            price: item.price,
                            quantity: item.quantity,
                            stock: 9999,
                        }));
                        setCart(cartItems);
                        if (quote.customerId) {
                            setSelectedCustomer(quote.customer || { id: quote.customerId, name: quote.customerName || "Unknown" });
                        }
                        router.replace("/");
                        alert("Quote loaded into cart!");
                    } else {
                        alert("Failed to load quote");
                    }
                } catch (error) {
                    console.error("Error loading quote:", error);
                }
            };
            fetchQuote();
        }
    }, [searchParams, router]);

    const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);
    // const { data: products, mutate: mutateProducts } = useSWR<Product[]>("/api/products", fetcher);
    // Note: mutateProducts is unused in original code, keeping products
    const { data: products } = useSWR<Product[]>("/api/products", fetcher);
    const { data: packages } = useSWR<Package[]>("/api/packages", fetcher);

    // Cart & Order State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [discountType, setDiscountType] = useState<DiscountType>("NONE");
    // const [discountValue, setDiscountValue] = useState(0); // Unused in original logic rendering? Yes, unused.

    // Customer State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [customerList, setCustomerList] = useState<any[]>([]);

    // Checkout State
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [change, setChange] = useState(0);
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Split Payment State
    const [splitPayments, setSplitPayments] = useState<{ method: string, amount: number }[]>([]);
    const [splitPaymentMethod, setSplitPaymentMethod] = useState("CASH");
    const [splitPaymentAmount, setSplitPaymentAmount] = useState("");
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

    // Gift Card & Loyalty State
    const [giftCardCode, setGiftCardCode] = useState("");
    const [giftCardData, setGiftCardData] = useState<any>(null);
    // const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_OUT">("DINE_IN"); // Unused

    // Completed Order for Receipt
    const [completedOrder, setCompletedOrder] = useState<any>(null);

    // Auto Print Toggle
    const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAutoPrintEnabled(localStorage.getItem('pos-auto-print') === 'true');
        }
    }, []);

    // Shift Logic
    const [currentShift, setCurrentShift] = useState<any>(null);
    const [showOpenShift, setShowOpenShift] = useState(false);
    const [showCloseShift, setShowCloseShift] = useState(false);
    const [loadingShift, setLoadingShift] = useState(true);

    // Fetch current shift on mount
    const fetchCurrentShift = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchCurrentShift();
    }, [fetchCurrentShift]);

    // Fetch Customers
    const fetchCustomers = useCallback(async () => {
        try {
            const res = await fetch(`/ api / customers ? query = ${customerSearchQuery} `);
            const data = await res.json();
            setCustomerList(data);
        } catch (e) { console.error(e); }
    }, [customerSearchQuery]);

    useEffect(() => {
        if (isCustomerModalOpen) {
            fetchCustomers();
        }
    }, [isCustomerModalOpen, fetchCustomers]);

    // Held orders state
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [heldOrdersCount, setHeldOrdersCount] = useState(0);

    // Fetch held orders count
    const fetchHeldOrdersCount = useCallback(async () => {
        try {
            const res = await fetch("/api/orders/held");
            if (res.ok) {
                const data = await res.json();
                setHeldOrdersCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch held orders count", error);
        }
    }, []);

    useEffect(() => {
        fetchHeldOrdersCount();
    }, [fetchHeldOrdersCount]);

    // Helper Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = discountType !== "NONE" ? subtotal * 0.20 : 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountType !== "NONE" ? 0 : discountedSubtotal * 0.12;
    const totalAmount = discountedSubtotal + tax;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const calculatedChange = amountPaid ? Math.max(0, parseFloat(amountPaid) - totalAmount) : 0;

    // Split Payment Helpers
    const addSplitPayment = () => {
        const amount = parseFloat(splitPaymentAmount);
        if (!amount || amount <= 0) return;
        setSplitPayments([...splitPayments, { method: splitPaymentMethod, amount }]);
        setSplitPaymentAmount("");
    };

    const removeSplitPayment = (index: number) => {
        const newPayments = [...splitPayments];
        newPayments.splice(index, 1);
        setSplitPayments(newPayments);
    };

    const getRemainingBalance = () => {
        const paid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
        return Math.max(0, totalAmount - paid);
    };

    // Park current order
    const parkOrder = async () => {
        if (cart.length === 0) return;
        try {
            const res = await fetch("/api/orders/held", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    total: totalAmount,
                    discountType,
                    discountAmount: discount,
                    paymentMethod,
                    parkedBy: "Cashier",
                    storeId: "default-store-id",
                    shiftId: currentShift?.id || null,
                }),
            });
            if (res.ok) {
                setCart([]);
                setDiscountType("NONE");
                setPaymentMethod("CASH");
                setAmountPaid("");
                setSplitPayments([]);
                alert("Order parked successfully!");
                fetchHeldOrdersCount();
                setShowPayment(false);
            }
        } catch (error) {
            console.error("Failed to park order", error);
            alert("Failed to park order");
        }
    };

    // Save as Quote logic
    const saveAsQuote = async () => {
        if (cart.length === 0) {
            alert("Cannot create quote with empty cart");
            return;
        }
        const notes = prompt("Enter notes for this quote (optional):");
        const validUntil = prompt("Valid until (YYYY-MM-DD) optional:", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        try {
            const res = await fetch("/api/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    total: totalAmount,
                    discountType,
                    discountAmount: discount,
                    customerId: selectedCustomer?.id || null,
                    customerName: selectedCustomer ? selectedCustomer.name : (prompt("Enter Customer Name for Walk-in:") || "Walk-in"),
                    notes,
                    validUntil,
                    storeId: "default-store-id",
                }),
            });

            if (res.ok) {
                setCart([]);
                setDiscountType("NONE");
                alert("Quote created successfully!");
                router.push("/quotes");
            } else {
                throw new Error("Failed to create quote");
            }
        } catch (error) {
            console.error("Failed to create quote", error);
            alert("Failed to create quote");
        }
    };

    // Restore held order
    const restoreOrder = (order: any) => {
        const restoredCart = order.items.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            category: item.product.category,
        }));

        setCart(restoredCart);
        setDiscountType(order.discountType || "NONE");
        setPaymentMethod(order.paymentMethod === 'SPLIT' ? 'CASH' : order.paymentMethod || "CASH");
        fetchHeldOrdersCount();
    };

    // Variant Selection State
    const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

    const addToCart = (product: Product, variant?: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => {
                if (variant) return item.id === product.id && item.variantId === variant.id;
                return item.id === product.id && !item.variantId;
            });

            if (existing) {
                return prev.map((item) =>
                    (variant ? (item.id === product.id && item.variantId === variant.id) : (item.id === product.id && !item.variantId))
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                ...product,
                quantity: 1,
                price: variant ? (variant.price || product.price) : product.price,
                variantId: variant?.id,
                variantName: variant?.name
            }];
        });
    };

    const addPackageToCart = (pkg: Package) => {
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

    // Barcode Scanner Listener
    const barcodeBufferRef = useRef("");
    const lastKeyTimeRef = useRef(Date.now());

    const handleBarcodeScan = useCallback(async (code: string) => {
        let product = products?.find(p => p.barcode === code);
        let variant: any = null;

        if (!product) {
            for (const p of products || []) {
                const v = p.variants?.find((v: any) => v.barcode === code);
                if (v) {
                    product = p;
                    variant = v;
                    break;
                }
            }
        }

        if (!product) {
            try {
                const res = await fetch(`/ api / products ? barcode = ${code} `);
                const data = await res.json();
                if (data && data.length > 0) {
                    product = data[0];
                    if (product && product.variants) {
                        const v = product.variants.find((v: any) => v.barcode === code);
                        if (v) variant = v;
                    }
                }
            } catch (e) {
                console.error("Scan error", e);
            }
        }

        if (product) {
            if (variant) {
                addToCart(product, variant);
            } else if (product.hasVariants) {
                setSelectedProductForVariants(product);
            } else {
                addToCart(product);
            }
        }
    }, [products]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            const now = Date.now();
            if (now - lastKeyTimeRef.current > 100) {
                barcodeBufferRef.current = "";
            }
            lastKeyTimeRef.current = now;

            if (e.key === "Enter") {
                if (barcodeBufferRef.current.length > 3) {
                    await handleBarcodeScan(barcodeBufferRef.current);
                    barcodeBufferRef.current = "";
                }
            } else if (e.key.length === 1) {
                barcodeBufferRef.current += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleBarcodeScan]);

    useKeyboardShortcuts([
        { key: "F4", action: () => document.getElementById("product-search")?.focus() },
        {
            key: "F9", action: () => {
                if (cart.length > 0) setShowPayment(true);
            }
        },
        { key: "Escape", action: () => setShowPayment(false) }
    ]);

    // Verify Gift Card
    const verifyGiftCard = () => {
        if (giftCardCode === 'GIFT100') {
            setGiftCardData({ code: 'GIFT100', currentBalance: 100.00 });
        } else if (giftCardCode === 'GIFT500') {
            setGiftCardData({ code: 'GIFT500', currentBalance: 500.00 });
        } else {
            alert("Invalid Gift Card Code");
            setGiftCardData(null);
        }
    };

    // Change Calculation
    useEffect(() => {
        if (!amountPaid || isNaN(parseFloat(amountPaid))) {
            setChange(0);
            return;
        }
        const paid = parseFloat(amountPaid);
        setChange(paid - totalAmount);
    }, [amountPaid, totalAmount]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!showPayment) {
            setShowPayment(true);
            return;
        }

        setIsProcessing(true);
        try {
            let finalPayments = [];
            if (paymentMethod === 'SPLIT') {
                finalPayments = splitPayments;
                if (getRemainingBalance() > 0) {
                    throw new Error("Payment incomplete");
                }
            } else if (paymentMethod === 'CREDIT') {
                if (!selectedCustomer) throw new Error("Select a customer for Credit payment");
                finalPayments = [{ method: 'CREDIT', amount: totalAmount }];
            } else if (paymentMethod === 'GIFT_CARD') {
                if (!giftCardData) throw new Error("Please verify gift card first");
                if (giftCardData.currentBalance < totalAmount) throw new Error("Insufficient Gift Card Balance");
                finalPayments = [{ method: 'GIFT_CARD', amount: totalAmount }];
            } else if (paymentMethod === 'LOYALTY_POINTS') {
                if (!selectedCustomer) throw new Error("Payment requires customer selection");
                if (selectedCustomer.pointsBalance < totalAmount) throw new Error("Insufficient Loyalty Points");
                finalPayments = [{ method: 'LOYALTY_POINTS', amount: totalAmount }];
            } else if (paymentMethod === 'GCASH' || paymentMethod === 'MAYA') {
                if (!paymentReference) throw new Error(`${paymentMethod} Reference Number is required`);
                finalPayments = [{ method: paymentMethod, amount: totalAmount }];
            } else {
                finalPayments = [{ method: paymentMethod, amount: totalAmount }];
            }

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
                    discount: discount,
                    paymentMethod: paymentMethod === 'SPLIT' ? 'SPLIT' : paymentMethod,
                    payments: finalPayments,
                    amountPaid: parseFloat(amountPaid) || totalAmount,
                    shiftId: currentShift?.id,
                    customerId: selectedCustomer?.id
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Checkout failed");
            }

            const orderData = await res.json();
            setCompletedOrder(orderData);
            setCart([]);
            setDiscountType('NONE');
            setAmountPaid("");
            setSplitPayments([]);
            setSelectedCustomer(null);
            setShowPayment(false);

            const autoPrintEnabled = localStorage.getItem('pos-auto-print') === 'true';
            if (autoPrintEnabled) {
                setTimeout(() => window.print(), 500);
            }
            alert("Order completed successfully!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Numpad State
    const [isNumpadOpen, setIsNumpadOpen] = useState(false);
    const [numpadTitle, setNumpadTitle] = useState("");
    const [numpadInitialValue, setNumpadInitialValue] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const [numpadCallback, setNumpadCallback] = useState<(val: string) => void>(() => { });

    const openNumpad = (title: string, initialValue: string, onConfirm: (val: string) => void) => {
        setNumpadTitle(title);
        setNumpadInitialValue(initialValue);
        setNumpadCallback(() => onConfirm);
        setIsNumpadOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <NumpadModal
                isOpen={isNumpadOpen}
                onClose={() => setIsNumpadOpen(false)}
                onConfirm={numpadCallback}
                title={numpadTitle}
                initialValue={numpadInitialValue}
            />

            {/* Navigation Sidebar (Left) */}
            <NavigationSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
                {!showPayment ? (
                    <>
                        {/* Header */}
                        <POSHeader
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            currentShift={currentShift}
                            onOpenShift={() => setShowOpenShift(true)}
                            onCloseShift={() => setShowCloseShift(true)}
                            autoPrintEnabled={autoPrintEnabled}
                            setAutoPrintEnabled={setAutoPrintEnabled}
                            selectedCustomer={selectedCustomer}
                            onCustomerSelectClick={() => setIsCustomerModalOpen(true)}
                        />

                        {/* Product Grid */}
                        <ProductGrid
                            products={products}
                            categories={categories}
                            packages={packages}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            searchQuery={searchQuery}
                            onAddToCart={addToCart}
                            onAddPackageToCart={addPackageToCart}
                            isLoading={!products}
                        />
                    </>
                ) : (
                    // PAYMENT SELECTION VIEW
                    <PaymentInterface
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        totalAmount={totalAmount}
                        amountPaid={amountPaid}
                        setAmountPaid={setAmountPaid}
                        change={change}
                        onBack={() => setShowPayment(false)}
                        giftCardCode={giftCardCode}
                        setGiftCardCode={setGiftCardCode}
                        verifyGiftCard={verifyGiftCard}
                        giftCardData={giftCardData}
                        selectedCustomer={selectedCustomer}
                        paymentReference={paymentReference}
                        setPaymentReference={setPaymentReference}
                        onOpenSplitModal={() => setIsSplitModalOpen(true)}
                        onOpenNumpad={openNumpad}
                        onProcessPayment={handleCheckout}
                    />
                )}
            </div>

            {/* Mobile Cart Sheet - keeping it inline for simplicity, or could extract */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg">
                            <ShoppingCart className="h-6 w-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Current Order ({cart.length} items)
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">₱{item.price} x {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t space-y-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₱{totalAmount.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={() => setShowPayment(true)} disabled={cart.length === 0}>
                                Checkout
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Cart Sidebar - Desktop Only */}
            <CartSidebar
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                totalAmount={totalAmount}
                discountType={discountType}
                setDiscountType={setDiscountType}
                onCheckout={() => setShowPayment(true)}
                showPayment={showPayment}
                onShowHeldOrders={() => setShowHeldOrders(true)}
                onParkOrder={parkOrder}
                heldOrdersCount={heldOrdersCount}
                onAddToCart={(p) => addToCart(p)}
            />

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

            {/* Split Payment Modal */}
            <Dialog open={isSplitModalOpen} onOpenChange={setIsSplitModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Split Payment
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                            <span className="font-semibold text-muted-foreground">Remaining Balance</span>
                            <span className={cn("text-2xl font-bold", getRemainingBalance() > 0 ? "text-red-500" : "text-green-500")}>
                                ₱{getRemainingBalance().toFixed(2)}
                            </span>
                        </div>

                        {getRemainingBalance() > 0 && (
                            <div className="flex gap-2">
                                <select
                                    className="flex h-10 w-1/3 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={splitPaymentMethod}
                                    onChange={(e) => setSplitPaymentMethod(e.target.value)}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="GCASH">GCash</option>
                                    <option value="MAYA">Maya</option>
                                    <option value="CARD">Card</option>
                                </select>
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                                    <Input
                                        type="number"
                                        value={splitPaymentAmount}
                                        onChange={(e) => setSplitPaymentAmount(e.target.value)}
                                        className="pl-7"
                                        placeholder={getRemainingBalance().toFixed(2)}
                                    />
                                </div>
                                <Button onClick={addSplitPayment}>Add</Button>
                            </div>
                        )}

                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {splitPayments.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-4">No payments added yet.</p>
                            ) : (
                                splitPayments.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{p.method}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold">₱{p.amount.toFixed(2)}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeSplitPayment(idx)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={getRemainingBalance() > 0}
                            onClick={() => setIsSplitModalOpen(false)}
                        >
                            {getRemainingBalance() > 0 ? `Remaining: ₱${getRemainingBalance().toFixed(2)} ` : "Done - Confirm Split"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Held Orders Panel */}
            <HeldOrdersPanel
                isOpen={showHeldOrders}
                onClose={() => setShowHeldOrders(false)}
                onRestore={restoreOrder}
                onRefresh={fetchHeldOrdersCount}
            />

            {/* Customer Selection Modal */}
            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                            {customerList.length === 0 ? (
                                <p className="text-center text-muted-foreground">No customers found.</p>
                            ) : (
                                customerList.map((customer) => (
                                    <Button
                                        key={customer.id}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setIsCustomerModalOpen(false);
                                        }}
                                    >
                                        {customer.name}
                                        {customer.totalDebt > 0 && (
                                            <span className="ml-2 text-red-500 text-xs">(Debt: ₱{customer.totalDebt.toFixed(2)})</span>
                                        )}
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>
                    {selectedCustomer && (
                        <div className="mt-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="text-sm font-medium">Selected: {selectedCustomer.name}</p>
                            {selectedCustomer.totalDebt > 0 && (
                                <p className="text-xs text-red-500">Current Debt: ₱{selectedCustomer.totalDebt.toFixed(2)}</p>
                            )}
                            {selectedCustomer.creditLimit !== undefined && selectedCustomer.creditLimit !== null && ( // Explicit check for undefined
                                <p className="text-xs text-muted-foreground">Credit Limit: ₱{selectedCustomer.creditLimit.toFixed(2)}</p>
                            )}
                        </div>
                    )}
                    <Button onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(false); }} className="mt-2 w-full" variant="outline">
                        Clear Customer
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
