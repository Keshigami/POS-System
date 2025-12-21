"use client";

import { ShoppingCart, Minus, Plus, Trash2, Sparkles, Archive, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem, Product, DiscountType } from "@/types/pos";
import { SmartSuggestions } from "./SmartSuggestions";

interface CartSidebarProps {
    cart: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveFromCart: (id: string) => void;
    subtotal: number;
    discount: number;
    tax: number;
    totalAmount: number;
    discountType: DiscountType;
    setDiscountType: (type: DiscountType) => void;
    onCheckout: () => void;
    showPayment: boolean;
    onShowHeldOrders: () => void;
    onParkOrder: () => void;
    heldOrdersCount: number;
    onAddToCart: (product: Product) => void;
}

export function CartSidebar({
    cart,
    onUpdateQuantity,
    onRemoveFromCart,
    subtotal,
    discount,
    tax,
    totalAmount,
    discountType,
    setDiscountType,
    onCheckout,
    showPayment,
    onShowHeldOrders,
    onParkOrder,
    heldOrdersCount,
    onAddToCart
}: CartSidebarProps) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="hidden lg:flex w-96 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex-col h-full shadow-xl">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                <h2 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                    <ShoppingCart className="h-5 w-5" />
                    Cart
                </h2>
                <span className="text-sm text-muted-foreground bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-16 w-16 mb-3 opacity-20" />
                        <p className="text-lg font-medium">Cart is empty</p>
                        <p className="text-sm mt-1">Tap products to add them</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700"
                        >
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate dark:text-white">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">₱{item.price.toFixed(2)} each</p>
                            </div>

                            {/* Quantity Controls - Compact */}
                            <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                                <button
                                    className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md transition-colors active:scale-95"
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold dark:text-white">
                                    {item.quantity}
                                </span>
                                <button
                                    className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md transition-colors active:scale-95"
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right min-w-[55px]">
                                <p className="font-bold text-sm dark:text-white">₱{(item.price * item.quantity).toFixed(2)}</p>
                            </div>

                            {/* Remove Button */}
                            <button
                                className="h-9 w-9 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-95"
                                onClick={() => onRemoveFromCart(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer - Totals & Actions */}
            <div className="border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                {/* Discount Selector - Only show when cart has items */}
                {cart.length > 0 && (
                    <div className="p-3 border-b dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                size="sm"
                                variant={discountType === "NONE" ? "default" : "outline"}
                                onClick={() => setDiscountType("NONE")}
                                className="text-xs h-9"
                            >
                                Regular
                            </Button>
                            <Button
                                size="sm"
                                variant={discountType === "SENIOR_CITIZEN" ? "default" : "outline"}
                                onClick={() => setDiscountType("SENIOR_CITIZEN")}
                                className="text-xs h-9"
                            >
                                Senior
                            </Button>
                            <Button
                                size="sm"
                                variant={discountType === "PWD" ? "default" : "outline"}
                                onClick={() => setDiscountType("PWD")}
                                className="text-xs h-9"
                            >
                                PWD
                            </Button>
                        </div>
                    </div>
                )}

                {/* Totals */}
                <div className="p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="dark:text-white">₱{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Discount (20%)</span>
                            <span>-₱{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="dark:text-white">
                            {tax > 0 ? `₱${tax.toFixed(2)}` : discountType !== "NONE" ? "VAT Exempt" : "₱0.00"}
                        </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-700">
                        <span className="dark:text-white">Total</span>
                        <span className="text-green-600 dark:text-green-400">₱{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Smart Suggestions - Compact, only when cart has items */}
                {cart.length > 0 && !showPayment && (
                    <div className="px-3 pb-2">
                        <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Suggestions</span>
                        </div>
                        <SmartSuggestions cartItems={cart} onAdd={onAddToCart} />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-3 pt-0 space-y-2">
                    {/* Secondary Actions Row */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={onShowHeldOrders}
                        >
                            <Archive className="mr-1 h-3 w-3" />
                            Held {heldOrdersCount > 0 && `(${heldOrdersCount})`}
                        </Button>
                        {cart.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={onParkOrder}
                            >
                                <FileText className="mr-1 h-3 w-3" />
                                Hold
                            </Button>
                        )}
                    </div>

                    {/* Primary Pay Button */}
                    <Button
                        className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={onCheckout}
                    >
                        Pay ₱{totalAmount.toFixed(2)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
