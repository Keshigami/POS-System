"use client";

import { Wallet, Smartphone, CreditCard, Sparkles, FileText, Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentMethod, Customer } from "@/types/pos";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    const isCashPayment = paymentMethod === "CASH";
    const isDigitalPayment = ["GCASH", "MAYA", "CARD"].includes(paymentMethod);

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 animate-in fade-in slide-in-from-right-4 duration-300">
            <header className="bg-white p-4 shadow-sm z-10 flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" /> Back to Products
                </Button>
                <h2 className="text-xl font-bold">Select Payment Method</h2>
            </header>

            <div className="p-6 md:p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Primary Methods */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button
                            variant={paymentMethod === "CASH" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("CASH")}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "CASH" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <Wallet className="h-10 w-10 mb-1" />
                            <span className="font-bold text-xl">Cash</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "GCASH" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("GCASH")}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "GCASH" ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <Smartphone className="h-10 w-10 text-blue-500 mb-1" />
                            <span className="font-bold text-xl">GCash</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "MAYA" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("MAYA")}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "MAYA" ? "border-green-500 bg-green-50 text-green-600 ring-2 ring-green-500/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <Smartphone className="h-10 w-10 text-green-500 mb-1" />
                            <span className="font-bold text-xl">Maya</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "CARD" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("CARD")}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "CARD" ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-500/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <CreditCard className="h-10 w-10 text-orange-500 mb-1" />
                            <span className="font-bold text-xl">Card</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "SPLIT" ? "default" : "outline"}
                            onClick={() => {
                                setPaymentMethod("SPLIT");
                                onOpenSplitModal();
                            }}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "SPLIT" ? "border-purple-500 bg-purple-50 text-purple-600 ring-2 ring-purple-500/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <Sparkles className="h-10 w-10 text-purple-500 mb-1" />
                            <span className="font-bold text-xl">Split Pay</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "CREDIT" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("CREDIT")}
                            disabled={!selectedCustomer}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "CREDIT" ? "border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20" : "border-gray-200 bg-white",
                                !selectedCustomer && "opacity-60 grayscale cursor-not-allowed"
                            )}
                        >
                            <FileText className="h-10 w-10 text-red-500 mb-1" />
                            <span className="font-bold text-xl">Charge (Utang)</span>
                            {!selectedCustomer && <span className="text-xs text-muted-foreground font-normal">(Select Customer First)</span>}
                        </Button>

                        <Button
                            variant={paymentMethod === "GIFT_CARD" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("GIFT_CARD")}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "GIFT_CARD" ? "border-pink-500 bg-pink-50 text-pink-600 ring-2 ring-pink-500/20" : "border-gray-200 bg-white"
                            )}
                        >
                            <Gift className="h-10 w-10 text-pink-500 mb-1" />
                            <span className="font-bold text-xl">Gift Card</span>
                        </Button>

                        <Button
                            variant={paymentMethod === "LOYALTY_POINTS" ? "default" : "outline"}
                            onClick={() => setPaymentMethod("LOYALTY_POINTS")}
                            disabled={!selectedCustomer}
                            className={cn(
                                "h-32 flex flex-col items-center justify-center gap-3 border-2 transition-all hover:scale-[1.02] hover:shadow-lg rounded-xl",
                                paymentMethod === "LOYALTY_POINTS" ? "border-yellow-500 bg-yellow-50 text-yellow-600 ring-2 ring-yellow-500/20" : "border-gray-200 bg-white",
                                !selectedCustomer && "opacity-60 grayscale cursor-not-allowed"
                            )}
                        >
                            <Sparkles className="h-10 w-10 text-yellow-500 mb-1" />
                            <span className="font-bold text-xl">Loyalty Pts</span>
                        </Button>
                    </div>

                    {/* Additional Details for selected payment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                            {paymentMethod === "CASH" && <Wallet className="h-5 w-5 text-gray-500" />}
                            {paymentMethod === "GCASH" && <Smartphone className="h-5 w-5 text-blue-500" />}
                            Transaction Details - {paymentMethod}
                        </h3>

                        {/* Cash Payment Input */}
                        {isCashPayment && (
                            <div className="max-w-md">
                                <Label className="text-base">Amount Tendered</Label>
                                <div className="flex gap-2 mt-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₱</span>
                                        <Input
                                            type="number"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            className="text-2xl font-bold h-14 pl-8"
                                            placeholder="0.00"
                                            readOnly={true}
                                            onClick={() => onOpenNumpad("Enter Cash Amount", amountPaid, (val) => setAmountPaid(val))}
                                            autoFocus
                                        />
                                    </div>
                                    <Button variant="outline" className="h-14 w-14" onClick={() => onOpenNumpad("Enter Cash Amount", amountPaid, (val) => setAmountPaid(val))}>
                                        <span className="text-xl">⌨️</span>
                                    </Button>
                                </div>

                                {/* Quick Cash Buttons */}
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    {[20, 50, 100, 200, 500, 1000].map(amt => (
                                        <Button
                                            key={amt}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAmountPaid(amt.toString())}
                                            className="rounded-full px-4 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                                        >
                                            ₱{amt}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAmountPaid(Math.ceil(totalAmount).toString())}
                                        className="rounded-full px-4 bg-yellow-50 text-yellow-700 border-yellow-200"
                                    >
                                        Exact (₱{Math.ceil(totalAmount)})
                                    </Button>
                                </div>

                                {amountPaid && !isNaN(parseFloat(amountPaid)) && (
                                    <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg border">
                                        <span className="text-lg font-medium text-gray-600">Change Due:</span>
                                        <span className={cn("text-3xl font-bold", change >= 0 ? "text-green-600" : "text-red-600")}>
                                            ₱{change.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Digital Payment Input */}
                        {isDigitalPayment && (
                            <div className="max-w-md space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4 items-start">
                                    <div className="bg-white p-2 rounded border">
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMONGO_MOCK_${paymentMethod}_${totalAmount}`}
                                            alt="Payment QR"
                                            width={96}
                                            height={96}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900">Scan to Pay</p>
                                        <p className="text-sm text-blue-700 mt-1">Ask customer to scan this QR code using their {paymentMethod} app.</p>
                                        <p className="text-xl font-bold mt-2">Amount: ₱{totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label>Reference Number</Label>
                                    <Input
                                        placeholder="Enter transaction ID (Last 6 digits)"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        className="mt-1 h-12 text-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Gift Card Logic */}
                        {paymentMethod === "GIFT_CARD" && (
                            <div className="space-y-3 animate-fade-in border p-3 rounded-md bg-white max-w-md">
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
                        {paymentMethod === "LOYALTY_POINTS" && selectedCustomer && (
                            <div className="space-y-3 animate-fade-in border p-3 rounded-md bg-white max-w-md">
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
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end md:static md:bg-transparent md:border-t-0 md:p-0">
                        <Button
                            size="lg"
                            className="w-full md:w-auto text-xl py-8 px-12 bg-green-600 hover:bg-green-700 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500"
                            onClick={onProcessPayment}
                            disabled={!amountPaid && !isDigitalPayment && paymentMethod !== 'SPLIT' && paymentMethod !== 'GIFT_CARD' && paymentMethod !== 'LOYALTY_POINTS'}
                        >
                            Complete Payment <span className="ml-2 font-mono">₱{totalAmount.toFixed(2)}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
