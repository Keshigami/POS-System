import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface OrderItem {
    product: {
        name: string;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    receiptNumber?: number;
    total: number;
    paymentMethod: string;
    paymentReference?: string;
    amountPaid?: number;
    discountType: string;
    discountAmount: number;
    items: OrderItem[];
    createdAt: string | Date;
}

interface ReceiptProps {
    order: Order | null;
    onClose: () => void;
}

export function Receipt({ order, onClose }: ReceiptProps) {
    const [title, setTitle] = useState("OFFICIAL RECEIPT");

    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // VAT Calculations
    let vatableSales = 0;
    let vatAmount = 0;
    let vatExemptSales = 0;
    let zeroRatedSales = 0;

    if (order.discountType !== "NONE") {
        vatExemptSales = order.total;
    } else {
        vatableSales = order.total / 1.12;
        vatAmount = order.total - vatableSales;
    }

    const handlePrint = (docTitle: string) => {
        setTitle(docTitle);
        // Timeout to allow state update before printing
        setTimeout(() => window.print(), 100);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Print-only header */}
                <div className="hidden print:block text-center py-4 border-b">
                    {/* Header content duplicates in print view via CSS, but title needs to be dynamic */}
                </div>

                {/* Screen header */}
                <div className="p-4 border-b flex items-center justify-between print:hidden">
                    <h2 className="text-xl font-bold">Transaction Details</h2>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => handlePrint("OFFICIAL RECEIPT")}>
                            Print OR
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrint("SALES INVOICE")}>
                            Print Invoice
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Receipt content */}
                <div className="p-6 print:p-8 text-xs font-mono" id="receipt-content">
                    {/* Store Info */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold">POS SYSTEM PH</h1>
                        <p className="text-xs text-muted-foreground">123 Business Street, Makati City</p>
                        <p className="text-xs text-muted-foreground">TIN: 123-456-789-00000</p>
                    </div>

                    <div className="text-center mb-4">
                        <p className="font-bold text-lg">{title}</p>
                        <p>{title === "OFFICIAL RECEIPT" ? "OR" : "SI"} No: {(order.receiptNumber || 0).toString().padStart(9, '0')}</p>
                        <p>{new Date(order.createdAt).toLocaleString("en-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-4 space-y-1 border-t border-b py-2 border-dashed">
                        <div className="flex font-bold mb-1">
                            <span className="flex-1">Item</span>
                            <span className="w-8 text-center">Qty</span>
                            <span className="w-16 text-right">Amount</span>
                        </div>
                        {order.items.map((item, index) => (
                            <div key={index} className="flex">
                                <span className="flex-1 truncate">{item.product.name}</span>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <span className="w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)}</span>
                        </div>

                        {order.discountAmount > 0 && (
                            <div className="flex justify-between">
                                <span>Less: {order.discountType === "SENIOR_CITIZEN" ? "SC/PWD Discount" : "Discount"}</span>
                                <span>({order.discountAmount.toFixed(2)})</span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-sm border-t border-dashed pt-2 mt-2">
                            <span>TOTAL AMOUNT DUE</span>
                            <span>{order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 pt-2 border-t border-dashed">
                        <div className="flex justify-between">
                            <span>Payment Type:</span>
                            <span>{order.paymentMethod}</span>
                        </div>

                        {order.amountPaid != null && (
                            <>
                                <div className="flex justify-between">
                                    <span>Amount Tendered:</span>
                                    <span>{order.amountPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Change:</span>
                                    <span>{(order.amountPaid - order.total).toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {order.paymentReference && (
                            <div className="flex justify-between">
                                <span>Ref No:</span>
                                <span>{order.paymentReference}</span>
                            </div>
                        )}
                    </div>

                    {/* VAT Analysis */}
                    <div className="mt-6 pt-2 border-t border-dashed text-[10px]">
                        <div className="flex justify-between">
                            <span>Vatable Sales</span>
                            <span>{vatableSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT Exempt Sales</span>
                            <span>{vatExemptSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Zero Rated Sales</span>
                            <span>{zeroRatedSales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT Amount (12%)</span>
                            <span>{vatAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-[10px]">
                        <p>Customer Name: _________________</p>
                        <p>Address: _______________________</p>
                        <p>TIN: ___________________________</p>
                        <br />
                        <p>THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX</p>
                        <p>Ack No: xxxxxxxx  Date: {new Date().toLocaleDateString()}</p>
                        <p>PTU No: FP122023-001-0000000</p>
                        <p>Date Issued: 01/01/2024</p>
                        <p>Valid Until: 01/01/2029</p>
                        <p className="mt-2 font-bold">Thank you! Please come again.</p>
                    </div>
                </div>
            </div>

            {/* Print-specific styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
