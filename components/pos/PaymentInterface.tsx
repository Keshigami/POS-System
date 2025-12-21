"use client";

import { useState } from "react";
import { Wallet, Smartphone, CreditCard, Sparkles, FileText, Gift, ArrowLeft, QrCode, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentMethod, Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

interface GiftCardData {
    currentBalance: number;
}

interface PaymentInterfaceProps {
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    totalAmount: number;
    amountPaid: string;
    setAmountPaid: (amount: string) => void;
    change: number;
    onBack: () => void;
    giftCardCode: string;
    setGiftCardCode: (code: string) => void;
    verifyGiftCard: () => void;
    giftCardData: GiftCardData | null;
    selectedCustomer: Customer | null;
    paymentReference: string;
    setPaymentReference: (ref: string) => void;
    onOpenSplitModal: () => void;
    onOpenNumpad: (title: string, initialValue: string, onConfirm: (val: string) => void) => void;
    onProcessPayment: () => void;
}

export function PaymentInterface({
    paymentMethod,
    setPaymentMethod,
    totalAmount,
    amountPaid,
    setAmountPaid,
    change,
    onBack,
    giftCardCode,
    setGiftCardCode,
    verifyGiftCard,
    giftCardData,
    selectedCustomer,
    paymentReference,
    setPaymentReference,
    onOpenSplitModal,
    onOpenNumpad,
    onProcessPayment
}: PaymentInterfaceProps) {
    const [showMoreMethods, setShowMoreMethods] = useState(false);

    const isCashPayment = paymentMethod === "CASH";
    const isDigitalPayment = ["GCASH", "MAYA", "CARD"].includes(paymentMethod);
    const isCreditPayment = paymentMethod === "CREDIT";

    // Payment method button component for consistency
    const PaymentButton = ({
        method,
        label,
        icon: Icon,
        color,
        disabled = false,
        subtitle
    }: {
        method: PaymentMethod;
        label: string;
        icon: React.ElementType;
        color: string;
        disabled?: boolean;
        subtitle?: string;
    }) => (
        <Button
            variant={paymentMethod === method ? "default" : "outline"}
            onClick={() => {
                setPaymentMethod(method);
                if (method === "SPLIT") onOpenSplitModal();
            }}
            disabled={disabled}
            className={cn(
                "h-24 md:h-28 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                paymentMethod === method
                    ? `border-${color}-500 bg-${color}-50 text-${color}-600 ring-2 ring-${color}-500/20 dark:bg-${color}-900/20`
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                disabled && "opacity-60 grayscale cursor-not-allowed"
            )}
            style={paymentMethod === method ? {
                borderColor: `var(--${color}-500, currentColor)`,
                backgroundColor: `var(--${color}-50, transparent)`
            } : undefined}
        >
            <Icon className={cn("h-8 w-8", `text-${color}-500`)} />
            <span className="font-bold text-lg">{label}</span>
            {subtitle && <span className="text-xs text-muted-foreground font-normal">{subtitle}</span>}
        </Button>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header with total prominently displayed */}
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="gap-2">
                        <ArrowLeft className="h-5 w-5" /> Back
                    </Button>
                    <h2 className="text-xl font-bold dark:text-white">Payment</h2>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Due</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">₱{totalAmount.toFixed(2)}</div>
                </div>
            </header>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* PRIMARY PAYMENT METHODS - 2x2 grid for quick access */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Cash - Most common */}
                        <Button
                            variant={paymentMethod === "CASH" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("CASH")}
                            className={cn(
                                "h-24 md:h-28 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "CASH"
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 ring-2 ring-green-500/20"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            )}
                        >
                            <Wallet className="h-8 w-8 text-green-600" />
                            <span className="font-bold text-lg dark:text-white">Cash</span>
                        </Button>

                        {/* GCash */}
                        <Button
                            variant={paymentMethod === "GCASH" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("GCASH")}
                            className={cn(
                                "h-24 md:h-28 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "GCASH"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 ring-2 ring-blue-500/20"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            )}
                        >
                            <Smartphone className="h-8 w-8 text-blue-500" />
                            <span className="font-bold text-lg dark:text-white">GCash</span>
                        </Button>

                        {/* Maya */}
                        <Button
                            variant={paymentMethod === "MAYA" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("MAYA")}
                            className={cn(
                                "h-24 md:h-28 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "MAYA"
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 ring-2 ring-emerald-500/20"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            )}
                        >
                            <Smartphone className="h-8 w-8 text-emerald-500" />
                            <span className="font-bold text-lg dark:text-white">Maya</span>
                        </Button>

                        {/* Credit (Utang) */}
                        <Button
                            variant={paymentMethod === "CREDIT" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("CREDIT")}
                            disabled={!selectedCustomer}
                            className={cn(
                                "h-24 md:h-28 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "CREDIT"
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 ring-2 ring-red-500/20"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                                !selectedCustomer && "opacity-60 grayscale cursor-not-allowed"
                            )}
                        >
                            <FileText className="h-8 w-8 text-red-500" />
                            <span className="font-bold text-lg dark:text-white">Utang</span>
                            {!selectedCustomer && <span className="text-[10px] text-muted-foreground">Select customer first</span>}
                        </Button>
                    </div>

                    {/* MORE PAYMENT OPTIONS - Collapsible */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowMoreMethods(!showMoreMethods)}
                            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            {showMoreMethods ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showMoreMethods ? "Hide" : "More"} payment options
                        </Button>

                        {showMoreMethods && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Card */}
                                <Button
                                    variant={paymentMethod === "CARD" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("CARD")}
                                    className={cn(
                                        "h-20 flex flex-col items-center justify-center gap-1 border-2 rounded-xl",
                                        paymentMethod === "CARD"
                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    )}
                                >
                                    <CreditCard className="h-6 w-6 text-orange-500" />
                                    <span className="font-semibold text-sm dark:text-white">Card</span>
                                </Button>

                                {/* Split Pay */}
                                <Button
                                    variant={paymentMethod === "SPLIT" ? "default" : "outline"}
                                    onClick={() => {
                                        setPaymentMethod("SPLIT");
                                        onOpenSplitModal();
                                    }}
                                    className={cn(
                                        "h-20 flex flex-col items-center justify-center gap-1 border-2 rounded-xl",
                                        paymentMethod === "SPLIT"
                                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    )}
                                >
                                    <Sparkles className="h-6 w-6 text-purple-500" />
                                    <span className="font-semibold text-sm dark:text-white">Split</span>
                                </Button>

                                {/* Gift Card */}
                                <Button
                                    variant={paymentMethod === "GIFT_CARD" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("GIFT_CARD")}
                                    className={cn(
                                        "h-20 flex flex-col items-center justify-center gap-1 border-2 rounded-xl",
                                        paymentMethod === "GIFT_CARD"
                                            ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    )}
                                >
                                    <Gift className="h-6 w-6 text-pink-500" />
                                    <span className="font-semibold text-sm dark:text-white">Gift Card</span>
                                </Button>

                                {/* Loyalty Points */}
                                <Button
                                    variant={paymentMethod === "LOYALTY_POINTS" ? "default" : "outline"}
                                    onClick={() => setPaymentMethod("LOYALTY_POINTS")}
                                    disabled={!selectedCustomer}
                                    className={cn(
                                        "h-20 flex flex-col items-center justify-center gap-1 border-2 rounded-xl",
                                        paymentMethod === "LOYALTY_POINTS"
                                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                                        !selectedCustomer && "opacity-60 grayscale"
                                    )}
                                >
                                    <Sparkles className="h-6 w-6 text-yellow-500" />
                                    <span className="font-semibold text-sm dark:text-white">Points</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* PAYMENT DETAILS SECTION */}
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">

                        {/* Cash Payment */}
                        {isCashPayment && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold dark:text-white">Amount Tendered</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₱</span>
                                        <Input
                                            type="number"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            className="text-2xl font-bold h-14 pl-8 dark:bg-gray-900 dark:text-white"
                                            placeholder="0.00"
                                            readOnly={true}
                                            onClick={() => onOpenNumpad("Enter Cash Amount", amountPaid, (val) => setAmountPaid(val))}
                                        />
                                    </div>
                                </div>

                                {/* Quick Cash Buttons - Larger for tablets */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[50, 100, 500, 1000].map(amt => (
                                        <Button
                                            key={amt}
                                            variant="outline"
                                            onClick={() => setAmountPaid(amt.toString())}
                                            className="h-12 text-base font-semibold hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-900/20"
                                        >
                                            ₱{amt}
                                        </Button>
                                    ))}
                                </div>

                                {/* Exact Amount Button */}
                                <Button
                                    variant="outline"
                                    onClick={() => setAmountPaid(Math.ceil(totalAmount).toString())}
                                    className="w-full h-12 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 font-semibold"
                                >
                                    Exact Amount: ₱{Math.ceil(totalAmount)}
                                </Button>

                                {/* Change Display */}
                                {amountPaid && !isNaN(parseFloat(amountPaid)) && (
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                                        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">Change:</span>
                                        <span className={cn("text-3xl font-bold", change >= 0 ? "text-green-600" : "text-red-600")}>
                                            ₱{change.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Digital Payment (GCash/Maya/Card) */}
                        {isDigitalPayment && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center">
                                        <QrCode className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-blue-900 dark:text-blue-300">Scan to Pay</p>
                                        <p className="text-xl font-bold mt-1 dark:text-white">₱{totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="dark:text-white">Reference # (Last 6 digits)</Label>
                                    <Input
                                        placeholder="Enter reference number"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        className="mt-1 h-12 text-lg dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Credit (Utang) */}
                        {isCreditPayment && selectedCustomer && (
                            <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-red-800 dark:text-red-300">Customer:</span>
                                    <span className="font-bold text-red-900 dark:text-red-200">{selectedCustomer.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-red-800 dark:text-red-300">Amount to Charge:</span>
                                    <span className="font-bold text-xl text-red-900 dark:text-red-200">₱{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Gift Card */}
                        {paymentMethod === "GIFT_CARD" && (
                            <div className="space-y-3">
                                <Label className="dark:text-white">Gift Card Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={giftCardCode}
                                        onChange={e => setGiftCardCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="dark:bg-gray-900 dark:text-white"
                                    />
                                    <Button onClick={verifyGiftCard}>Verify</Button>
                                </div>
                                {giftCardData && (
                                    <div className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-700 dark:text-green-400">
                                        <p className="font-semibold">Balance: ₱{giftCardData.currentBalance.toFixed(2)}</p>
                                        <p className="text-xs mt-1">
                                            {giftCardData.currentBalance >= totalAmount
                                                ? `Remaining after payment: ₱${(giftCardData.currentBalance - totalAmount).toFixed(2)}`
                                                : `Insufficient: Need ₱${(totalAmount - giftCardData.currentBalance).toFixed(2)} more`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Loyalty Points */}
                        {paymentMethod === "LOYALTY_POINTS" && selectedCustomer && (
                            <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-yellow-800 dark:text-yellow-300">Available Points:</span>
                                    <span className="font-bold text-yellow-900 dark:text-yellow-200">{selectedCustomer.pointsBalance} pts</span>
                                </div>
                                {selectedCustomer.pointsBalance < totalAmount && (
                                    <p className="text-xs text-red-500">
                                        Insufficient points. Need ₱{(totalAmount - selectedCustomer.pointsBalance).toFixed(2)} more.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STICKY COMPLETE BUTTON */}
            <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
                <Button
                    size="lg"
                    className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    onClick={onProcessPayment}
                    disabled={
                        (isCashPayment && (!amountPaid || parseFloat(amountPaid) < totalAmount)) ||
                        (isDigitalPayment && !paymentReference) ||
                        (isCreditPayment && !selectedCustomer) ||
                        (paymentMethod === "GIFT_CARD" && (!giftCardData || giftCardData.currentBalance < totalAmount)) ||
                        (paymentMethod === "LOYALTY_POINTS" && (!selectedCustomer || selectedCustomer.pointsBalance < totalAmount))
                    }
                >
                    Complete Payment — ₱{totalAmount.toFixed(2)}
                </Button>
            </div>
        </div>
    );
}
