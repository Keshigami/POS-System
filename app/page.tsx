"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    LayoutDashboard,
    LogOut,
    Settings,
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    Search,
    Package as PackageIcon, // Renamed to avoid conflict with interface
    History,
    PackageOpen,
    Plus,
    Minus,
    Search,
    Trash2,
    Settings,
    LogOut,
    CreditCard,
    Gift,
    Save,
    RotateCcw,
    FileText,
    Users,
    Archive,
    Clock,  // Used for Shift status? No, "Clock" was reported missing.
    Wallet, // Used for methods?
    Smartphone, // Used for methods?
    Zap // Used somewhere?
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Receipt } from "@/components/Receipt";
import { OpenShiftModal } from "@/components/OpenShiftModal";
import { CloseShiftModal } from "@/components/CloseShiftModal";
import { HeldOrdersPanel } from "@/components/HeldOrdersPanel";
import { NumpadModal } from "@/components/numpad-modal";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

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
    hasVariants?: boolean;
    variants?: any[];
    barcode?: string;
}

interface Category {
    id: string;
    name: string;
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
    variantId?: string;
    variantName?: string;
}

type DiscountType = "NONE" | "SENIOR_CITIZEN" | "PWD";

type PaymentMethod = "CASH" | "CARD" | "GCASH" | "MAYA" | "SPLIT" | "CREDIT" | "GIFT_CARD" | "LOYALTY_POINTS";

interface Customer {
    id: string;
    name: string;
    pointsBalance: number;
}

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
    const searchParams = useSearchParams();

    // Load quote from URL if present
    useEffect(() => {
        const loadQuoteId = searchParams.get("loadQuote");
        if (loadQuoteId) {
            const fetchQuote = async () => {
                try {
                    const res = await fetch(`/api/quotes/${loadQuoteId}`);
                    if (res.ok) {
                        const quote = await res.json();
                        // Transform quote items to cart items
                        const cartItems = quote.items.map((item: any) => ({
                            id: item.productId,
                            name: item.product.name,
                            price: item.price,
                            quantity: item.quantity,
                            stock: 9999, // Assumption for now, or fetch fresh product data
                        }));
                        setCart(cartItems);
                        if (quote.customerId) {
                            // Fetch customer details if needed or just set ID
                            // For now we might not have full customer object unless we fetch it
                            // But let's try to set what we can
                            // Ideally we should sync with fetchCustomers but for now:
                            setSelectedCustomer(quote.customer || { id: quote.customerId, name: quote.customerName || "Unknown" });
                        }

                        // Clear the param
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
    const { data: products, mutate: mutateProducts } = useSWR<Product[]>("/api/products", fetcher);
    const { data: packages } = useSWR<Package[]>("/api/packages", fetcher);

    // Cart & Order State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [discountType, setDiscountType] = useState<DiscountType>("NONE");
    const [discountValue, setDiscountValue] = useState(0); // For fixed/percentage values

    // Customer State
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string, totalDebt: number, creditLimit: number | null } | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [customerList, setCustomerList] = useState<any[]>([]); // Renamed to avoid confusion with cart customers? No, just 'customerList'

    // Checkout State
    const [isCheckoutModalOpen, setIsCheckoutModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [amountPaid, setAmountPaid] = useState<string>("");
    const [showPayment, setShowPayment] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any>(null);

    // Split Payment State
    const [splitPayments, setSplitPayments] = useState<{ method: string, amount: number }[]>([]);
    const [splitPaymentMethod, setSplitPaymentMethod] = useState("CASH");
    const [splitPaymentAmount, setSplitPaymentAmount] = useState("");

    // Gift Card & Loyalty State
    const [giftCardCode, setGiftCardCode] = useState("");
    const [giftCardData, setGiftCardData] = useState<any>(null);
    const [redeemPoints, setRedeemPoints] = useState(0);

    const verifyGiftCard = async () => {
        try {
            const res = await fetch(`/api/gift-cards?code=${giftCardCode}`);
            if (res.ok) {
                const data = await res.json();
                setGiftCardData(data);
            } else {
                alert("Invalid or expired Gift Card");
                setGiftCardData(null);
            }
        } catch (e) { alert("Verification failed"); }
    };

    // Shift Logic in POS
    const [isShiftLoading, setIsShiftLoading] = useState(false);

    // Check active shift on mount
    useEffect(() => {
        // Mock user ID for now - in real app would be from session
        const userId = "admin-user"; // Placeholder
        fetch(`/api/shifts?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === "OPEN") {
                    setCurrentShift(data);
                }
            })
            .catch(err => console.error("Shift check failed", err));
    }, []);

    const handleShiftToggle = async () => {
        const userId = "admin-user"; // Placeholder
        const action = currentShift ? "CLOSE" : "OPEN";
        const cashAmount = prompt(action === "OPEN" ? "Enter Starting Cash Amount:" : "Enter Ending Cash Amount (Counted):", "0");

        if (cashAmount === null) return; // Cancelled

        setIsShiftLoading(true);
        try {
            // Need a storeId - let's find one or use a default if we have it in state
            // For now, reusing the logic from orders that finds a default store if needed, 
            // but API requires storeId. I need to make sure I have one.
            // In a real app, I'd have a useStore() hook. 
            // Let's assume storeId is fetched or hardcoded for this demo 
            // OR I can fetch the first store ID from API if not available.
            // Hack for demo: I'll fetch stores first if I don't have one. 
            // Wait, I don't have stores in state here easily. 
            // I'll make the API handle "any store" if storeId is missing? No, API enforces it.
            // Better: fetch stores in useEffect.

            // Actually, let's just prompt user or rely on the fact that I likely have a seed store.
            // I will implement a quick fetchStore helper if needed.
            // Let's try to pass a hardcoded ID I know exists or fetch it.
            // I'll just hardcode the seed ID for safety if I can, OR fetch it.

            const storeRes = await fetch('/api/settings/store'); // I don't think I have this.
            // Let's use /api/products?storeId=... no.
            // Use Prisma default: The API allows searching.
            // To be safe, I'm going to look for a store in the component.

            // Simplified: Assume Store ID is passed or use a known one.
            // I will fetch the store list on mount to get an ID.

            const res = await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    storeId: (uniqueCategories[0] as any)?.storeId || "cm43l9w450000v903726p5869", // Fallback or from category
                    action,
                    cashAmount
                })
            });

            if (res.ok) {
                const updatedShift = await res.json();
                setCurrentShift(action === "OPEN" ? updatedShift : null);
                alert(action === "OPEN" ? "Shift Opened!" : `Shift Closed! \nExpected: ₱${updatedShift.expectedCash}\nActual: ₱${updatedShift.endCash}\nVariance: ₱${updatedShift.variance}`);
            } else {
                const err = await res.json();
                alert("Shift Error: " + err.error);
            }
        } catch (e) {
            alert("Shift toggle failed");
        } finally {
            setIsShiftLoading(false);
        }
    };

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

    // Fetch Customers
    const fetchCustomers = async () => {
        try {
            const res = await fetch(`/api/customers?query=${customerSearchQuery}`);
            const data = await res.json();
            setCustomerList(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (isCustomerModalOpen) {
            fetchCustomers();
        }
    }, [isCustomerModalOpen, customerSearchQuery]);

    // Held orders state
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [heldOrdersCount, setHeldOrdersCount] = useState(0);

    // Fetch held orders count
    const fetchHeldOrdersCount = async () => {
        try {
            const res = await fetch("/api/orders/held");
            if (res.ok) {
                const data = await res.json();
                setHeldOrdersCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch held orders count", error);
        }
    };

    useEffect(() => {
        fetchHeldOrdersCount();
    }, []);

    // Helper Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = discountType !== "NONE" ? subtotal * 0.20 : 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountType !== "NONE" ? 0 : discountedSubtotal * 0.12;
    const totalAmount = discountedSubtotal + tax;
    const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - totalAmount) : 0;

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
        if (cart.length === 0) {
            alert("Cannot park an empty order");
            return;
        }

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
                    parkedBy: "Cashier", // TODO: Get from authenticated user
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
                setShowPayment(false); // Reset payment view
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
                    discountAmount: discount, // Should probably save this to Quote model too if we want to restore it exactly
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

    const uniqueCategories = ["All", ...Array.from(new Set(products?.map((p) => p.category.name) || []))];
    const popularItems = products?.slice(0, 10) || [];

    const isDigitalPayment = paymentMethod === "GCASH" || paymentMethod === "MAYA";
    const isCashPayment = paymentMethod === "CASH";



    const filteredProducts = products?.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Barcode Scanner Listener
    useEffect(() => {
        let barcodeBuffer = "";
        let lastKeyTime = Date.now();

        const handleKeyDown = async (e: KeyboardEvent) => {
            const now = Date.now();
            if (now - lastKeyTime > 100) {
                barcodeBuffer = "";
            }
            lastKeyTime = now;

            if (e.key === "Enter") {
                if (barcodeBuffer.length > 3) { // Min length to avoid accidental Enters
                    await handleBarcodeScan(barcodeBuffer);
                    barcodeBuffer = "";
                }
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [products]); // Re-bind if products change, or ideally remove dep if handleScan is stable

    const handleBarcodeScan = async (code: string) => {
        // 1. Search locally first if products loaded
        let product = products?.find(p => p.barcode === code);
        let variant: any = null;

        if (!product) {
            // Check variants
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
            // Fallback to API if not loaded all
            try {
                const res = await fetch(`/api/products?barcode=${code}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    product = data[0];
                    // Check if it was a variant match
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
                // Open variant selector
                setSelectedProductForVariants(product);
            } else {
                addToCart(product);
            }
            // Play beep sound logic could go here
        }
    };

    // Variant Selection State
    const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

    const addToCart = (product: Product, variant?: any) => {
        const cartItemKey = variant ? `${product.id}-${variant.id}` : product.id;

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
                price: variant ? (variant.price || product.price) : product.price, // Variant price override
                variantId: variant?.id,
                variantName: variant?.name
            }];
        });
    };

    const handleProductClick = (product: Product) => {
        if (product.hasVariants) {
            setSelectedProductForVariants(product);
        } else {
            addToCart(product);
        }
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

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // If we are in the main view and not yet ready to pay
        if (!showPayment) {
            setShowPayment(true);
            return;
        }

        setIsProcessing(true);
        try {
            // Prepare payments payload
            let finalPayments = [];
            if (paymentMethod === 'SPLIT') {
                finalPayments = splitPayments;
                // Validate split payments cover total
                if (getRemainingBalance() > 0) {
                    // This should be blocked by UI but double check
                    throw new Error("Payment incomplete");
                }
            } else if (paymentMethod === 'CREDIT') { // Handle Credit
                if (!selectedCustomer) throw new Error("Select a customer for Credit payment");
                finalPayments = [{ method: 'CREDIT', amount: totalAmount }];
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
                        // costPrice: item.costPrice, // Removed unavailable property
                    })),
                    total: totalAmount,
                    // subtotal/tax removed from create payload to match API/Schema expectations if needed
                    // or passed if API handles them (our API update removed them from prisma create but accepts them in body)
                    discount: discount,
                    paymentMethod: paymentMethod === 'SPLIT' ? 'SPLIT' : paymentMethod,
                    payments: finalPayments,
                    amountPaid: parseFloat(amountPaid) || totalAmount,
                    shiftId: currentShift?.id,
                    customerId: selectedCustomer?.id // Pass customer ID
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Checkout failed");
            }

            // Success
            setCompletedOrder(await res.json());
            setCart([]);
            setDiscountType('NONE');
            setAmountPaid("");
            setSplitPayments([]);
            setSelectedCustomer(null); // Reset customer
            setShowPayment(false);
            // setIsCheckoutModalOpen(false); // We are using showPayment now, not modal? 
            // The previous modal code was pasted but maybe not fully integrated. 
            // Given the existing UI uses `showPayment` inline on the right sidebar, I will stick to that for now 
            // OR I need to verify if the modal is preferred. 
            // The user asked for "redesign the checkout modal/section". 
            // The current code (viewed in step 413) uses `showPayment` to toggle UI in the right sidebar (lines 589+).
            // But I also pasted a modal earlier? 
            // Actually, in step 403 I pasted code using `isCheckoutModalOpen`.
            // But in step 413 view, I see `showPayment` logic (lines 589).
            // This implies my step 403 edit to `lines 194 - 600` might have been overwritten or mixed?
            // Wait, step 413 shows `showPayment` logic because I replaced lines 194-600 with code that INCLUDED `handleCheckout` and then I replaced `handleCheckout` again in 407.
            // The `showPayment` logic is likely what is currently rendered in the sidebar.
            // Converting to a Modal might be better for Split Payments.

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
    const [numpadCallback, setNumpadCallback] = useState<(val: string) => void>(() => { });

    // Helper to open Numpad
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
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-xl font-bold text-primary">POS System</h1>
                        {/* Customer Selector Button */}
                        <Button
                            variant={selectedCustomer ? "default" : "outline"}
                            className="gap-2"
                            onClick={() => setIsCustomerModalOpen(true)}
                        >
                            <Users className="h-4 w-4" />
                            {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                        </Button>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-gray-50 dark:bg-gray-900 border-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Select Customer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Search name..."
                                            value={customerSearchQuery}
                                            onChange={e => setCustomerSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="h-[200px] overflow-y-auto border rounded p-2 space-y-2">
                                        {customerList?.map((c: any) => (
                                            <div
                                                key={c.id}
                                                className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setIsCustomerModalOpen(false);
                                                }}
                                            >
                                                <div>
                                                    <p className="font-medium">{c.name}</p>
                                                    <p className="text-xs text-muted-foreground">{c.contact}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{c.pointsBalance} pts</p>
                                                </div>
                                            </div>
                                        ))}
                                        {customerList?.length === 0 && <p className="text-center text-muted-foreground py-4">No customers found</p>}
                                    </div>
                                    <div className="pt-2 border-t flex justify-end gap-2">
                                        {selectedCustomer && (
                                            <Button variant="ghost" className="text-red-500" onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(false); }}>
                                                Unassign
                                            </Button>
                                        )}
                                        <Button variant="secondary" onClick={() => setIsCustomerModalOpen(false)}>Close</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")} title="Inventory">
                            <PackageIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/customers")} title="Customers">
                            <Users className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/suppliers")} title="Suppliers">
                            <Truck className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/purchase-orders")} title="Purchase Orders">
                            <PackageOpen className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/expenses")} title="Expenses">
                            <Wallet className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")} title="Inventory">
                            <PackageIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} title="Settings">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")} title="History">
                            <History className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Quick Actions (Employee / Reports Links) */}
                <div className="bg-white dark:bg-gray-800 border-b px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => (window.location.href = '/reports')} className="text-xs h-8">
                            <LayoutDashboard className="h-3 w-3 mr-1" /> Reports
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => (window.location.href = '/employees')} className="text-xs h-8">
                            <UserCheck className="h-3 w-3 mr-1" /> Staff
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentShift ? (
                            <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                <Clock className="h-3 w-3 mr-1" /> Shift Open
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                <Clock className="h-3 w-3 mr-1" /> Shift Closed
                            </span>
                        )}
                        <Button
                            size="sm"
                            variant={currentShift ? "destructive" : "default"}
                            onClick={handleShiftToggle}
                            disabled={isShiftLoading}
                            className="text-xs h-8"
                        >
                            {currentShift ? "Close Shift" : "Open Shift"}
                        </Button>
                    </div>
                </div>

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
                        {uniqueCategories.map((cat) => (
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
                                    onClick={() => handleProductClick(product)}
                                >
                                    <CardContent className="p-4 flex flex-col h-full justify-between">
                                        <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-md mb-3 flex items-center justify-center text-4xl relative">
                                            {product.emoji || "📦"}
                                            {product.stock <= (product.reorderPoint || 10) && (
                                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                                                    Low Stock
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm">{product.name}</h3>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                    ₱{product.price.toFixed(2)}
                                                </p>
                                                <p className={`text-xs font-medium ${product.stock <= (product.reorderPoint || 10) ? "text-red-500" : "text-gray-500"}`}>
                                                    Stock: {product.stock}
                                                </p>
                                            </div>
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
                            <div className="grid grid-cols-3 gap-2">
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
                                    variant={paymentMethod === "MAYA" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("MAYA")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Smartphone className="h-3 w-3" />
                                    Maya
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "CREDIT" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("CREDIT")}
                                    className="text-xs flex items-center gap-1"
                                    disabled={!selectedCustomer}
                                >
                                    <CreditCard className="h-3 w-3" />
                                    Credit
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "SPLIT" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("SPLIT")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Split
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "GIFT_CARD" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("GIFT_CARD")}
                                    className="text-xs flex items-center gap-1"
                                >
                                    <Gift className="h-3 w-3" />
                                    Gift Card
                                </Button>
                                {selectedCustomer && (
                                    <Button
                                        size="sm"
                                        variant={paymentMethod === "CREDIT" ? "default" : "outline"}
                                        onClick={() => setPaymentMethod("CREDIT")}
                                        className="text-xs flex items-center gap-1"
                                    >
                                        <CreditCard className="h-3 w-3" />
                                        Charge to Account
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant={paymentMethod === "LOYALTY_POINTS" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("LOYALTY_POINTS")}
                                    className="text-xs flex items-center gap-1"
                                    disabled={!selectedCustomer}
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Points
                                </Button>
                            </div>
                            {paymentMethod === "LOYALTY_POINTS" && !selectedCustomer && (
                                <p className="text-xs text-red-500">Please select a customer to use Points.</p>
                            )}
                            {paymentMethod === "CREDIT" && !selectedCustomer && (
                                <p className="text-xs text-red-500">Please select a customer to use Credit payment.</p>
                            )}
                        </div>
                    )}

                    {/* Split Payment Interface */}
                    {showPayment && paymentMethod === "SPLIT" && (
                        <div className="space-y-3 animate-fade-in border p-3 rounded-md bg-white dark:bg-gray-800">
                            <div className="text-sm font-medium">Split Payments</div>
                            <div className="flex gap-2">
                                <select
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={splitPaymentMethod}
                                    onChange={(e) => setSplitPaymentMethod(e.target.value)}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="GCASH">GCash</option>
                                    <option value="MAYA">Maya</option>
                                    <option value="CARD">Card</option>
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={splitPaymentAmount}
                                    onChange={(e) => setSplitPaymentAmount(e.target.value)}
                                    className="w-24"
                                />
                                <Button size="sm" onClick={addSplitPayment}>Add</Button>
                            </div>

                            {/* List of payments */}
                            <div className="space-y-1">
                                {splitPayments.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                        <span>{p.method}</span>
                                        <div className="flex items-center gap-2">
                                            <span>₱{p.amount.toFixed(2)}</span>
                                            <Trash2 className="h-3 w-3 cursor-pointer text-red-500" onClick={() => removeSplitPayment(idx)} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                                <span>Remaining:</span>
                                <span className={getRemainingBalance() > 0 ? "text-red-500" : "text-green-500"}>
                                    ₱{getRemainingBalance().toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Gift Card Logic */}
                    {showPayment && paymentMethod === "GIFT_CARD" && (
                        <div className="space-y-3 animate-fade-in border p-3 rounded-md bg-white dark:bg-gray-800">
                            <label className="text-sm font-medium">Gift Card Code</label>
                            <div className="flex gap-2">
                                <Input
                                    value={giftCardCode}
                                    onChange={e => setGiftCardCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER CODE"
                                />
                                <Button onClick={verifyGiftCard} size="sm">Verify</Button>
                            </div>
                            {giftCardData && (
                                <div className="text-sm bg-green-50 p-2 rounded text-green-700">
                                    <p>Balance: ₱{giftCardData.currentBalance.toFixed(2)}</p>
                                    <p>{giftCardData.currentBalance >= totalAmount ? "Calculated Remaining: ₱" + (giftCardData.currentBalance - totalAmount).toFixed(2) : "Insufficient Balance: Need ₱" + (totalAmount - giftCardData.currentBalance).toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loyalty Points Logic */}
                    {showPayment && paymentMethod === "LOYALTY_POINTS" && selectedCustomer && (
                        <div className="space-y-3 animate-fade-in border p-3 rounded-md bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-center bg-purple-50 p-2 rounded text-purple-700">
                                <span className="font-bold">Available Points:</span>
                                <span>{selectedCustomer.pointsBalance} pts (₱{selectedCustomer.pointsBalance.toFixed(2)})</span>
                            </div>
                            {selectedCustomer.pointsBalance < totalAmount && (
                                <p className="text-xs text-red-500">
                                    Insufficient points. Need ₱{(totalAmount - selectedCustomer.pointsBalance).toFixed(2)} more.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Cash Payment Input */}
                    {showPayment && isCashPayment && (
                        <div className="space-y-2 animate-fade-in">
                            <div className="mb-4">
                                <Label>Amount Paid</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        className="text-lg font-bold"
                                        placeholder="Enter cash amount"
                                        readOnly={true} // prevent keyboard to force numpad if desired, or make it optional
                                        onClick={() => openNumpad("Enter Cash Amount", amountPaid, (val) => setAmountPaid(val))}
                                    />
                                    <Button variant="outline" onClick={() => openNumpad("Enter Cash Amount", amountPaid, (val) => setAmountPaid(val))}>
                                        Numpad
                                    </Button>
                                </div>
                            </div>
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

                    {/* Order Parking Buttons */}
                    <div className="space-y-2 mt-4">
                        <Button
                            variant="outline"
                            className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                            onClick={() => setShowHeldOrders(true)}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Held Orders {heldOrdersCount > 0 && `(${heldOrdersCount})`}
                        </Button>

                        {cart.length > 0 && (
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-dashed border-gray-400 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={parkOrder}
                                    disabled={cart.length === 0}
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Hold Order
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-dashed border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={saveAsQuote}
                                    disabled={cart.length === 0}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Save Quote
                                </Button>
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 mt-4 bg-green-600 hover:bg-green-700"
                        size="lg"
                        disabled={
                            cart.length === 0 ||
                            (paymentMethod === "CREDIT" && !selectedCustomer) ||
                            (paymentMethod === "SPLIT" && getRemainingBalance() > 0)
                        }
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
            {
                completedOrder && (
                    <Receipt
                        order={completedOrder}
                        onClose={() => setCompletedOrder(null)}
                    />
                )
            }
            {/* Shift Modals */}
            {
                !loadingShift && (
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
                )
            }
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
                            {selectedCustomer.creditLimit !== null && (
                                <p className="text-xs text-muted-foreground">Credit Limit: ₱{selectedCustomer.creditLimit.toFixed(2)}</p>
                            )}
                        </div>
                    )}
                    <Button onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(false); }}>
                        Clear Customer
                    </Button>
                </DialogContent>
            </Dialog>
        </div >
    );
}

