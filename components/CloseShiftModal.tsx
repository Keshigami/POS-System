"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface CloseShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShiftClosed: () => void;
    shift: any;
}

export function CloseShiftModal({ isOpen, onClose, onShiftClosed, shift }: CloseShiftModalProps) {
    const [endCash, setEndCash] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleSubmit = async () => {
        if (!endCash || parseFloat(endCash) < 0) {
            alert("Please enter a valid ending cash amount");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/shifts/${shift.id}/close`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endCash: parseFloat(endCash),
                    notes,
                }),
            });

            if (res.ok) {
                const closedShift = await res.json();

                // Fetch Z-Reading
                const zReadingRes = await fetch(`/api/shifts/${shift.id}/z-reading`);
                if (zReadingRes.ok) {
                    const zData = await zReadingRes.json();
                    setReportData(zData);
                    setShowReport(true);
                }

                onShiftClosed();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to close shift");
            }
        } catch (error) {
            alert("Error closing shift");
        } finally {
            setLoading(false);
        }
    };

    const variance = endCash ? parseFloat(endCash) - (shift?.expectedCash || 0) : 0;

    if (showReport && reportData) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Z-Reading Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold">Shift Summary</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Started: {new Date(reportData.shift.startTime).toLocaleString()}</div>
                                <div>Ended: {new Date(reportData.shift.endTime).toLocaleString()}</div>
                                <div>Cashier: {reportData.shift.user.name}</div>
                                <div>Store: {reportData.shift.store.name}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">Sales Summary</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Cash Sales:</span>
                                    <span className="font-mono">₱{reportData.summary.cashSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Card Sales:</span>
                                    <span className="font-mono">₱{reportData.summary.cardSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">GCash:</span>
                                    <span className="font-mono">₱{reportData.summary.gcashSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">PayMaya:</span>
                                    <span className="font-mono">₱{reportData.summary.paymayaSales.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between font-bold">
                                    <span>Total Sales:</span>
                                    <span className="font-mono text-green-600">₱{reportData.summary.totalSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Total Orders:</span>
                                    <span>{reportData.summary.totalOrders}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Avg Order:</span>
                                    <span className="font-mono">₱{reportData.summary.avgOrderValue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold">Cash Reconciliation</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Opening Cash:</span>
                                    <span className="font-mono">₱{reportData.shift.startCash.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Closing Cash:</span>
                                    <span className="font-mono">₱{reportData.shift.endCash.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Expected Cash:</span>
                                    <span className="font-mono">₱{reportData.shift.expectedCash.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between font-bold pt-2 border-t ${reportData.shift.variance === 0 ? 'text-green-600' :
                                        reportData.shift.variance > 0 ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                    <span className="flex items-center gap-1">
                                        {reportData.shift.variance > 0 ? <TrendingUp className="h-4 w-4" /> :
                                            reportData.shift.variance < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                                        Variance:
                                    </span>
                                    <span className="font-mono">
                                        {reportData.shift.variance > 0 ? '+' : ''}₱{reportData.shift.variance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => window.print()} variant="outline">
                            Print Report
                        </Button>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-600" />
                        Close Shift
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Opening Cash:</span>
                            <span className="font-mono font-bold">₱{shift?.startCash?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Expected Cash:</span>
                            <span className="font-mono font-bold">₱{shift?.expectedCash?.toFixed(2) || "Calculating..."}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endCash">Actual Closing Cash (₱) *</Label>
                        <Input
                            id="endCash"
                            type="number"
                            step="0.01"
                            placeholder="Count cash in drawer"
                            value={endCash}
                            onChange={(e) => setEndCash(e.target.value)}
                            className="text-lg font-bold"
                        />
                        {endCash && (
                            <div className={`flex items-center gap-2 text-sm ${variance === 0 ? 'text-green-600' :
                                    variance > 0 ? 'text-blue-600' : 'text-red-600'
                                }`}>
                                {variance !== 0 && (
                                    variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                                )}
                                <span className="font-semibold">
                                    Variance: {variance > 0 ? '+' : ''}₱{variance.toFixed(2)}
                                    {variance === 0 && ' (Perfect!)'}
                                </span>
                            </div>
                        )}
                    </div>

                    {variance !== 0 && endCash && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-yellow-700 dark:text-yellow-400">Cash Variance Detected</p>
                                <p className="text-yellow-600 dark:text-yellow-300 text-xs">
                                    {variance > 0 ? 'Excess' : 'Shortage'} of ₱{Math.abs(variance).toFixed(2)}.
                                    Please recount or add notes below.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Closing Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Any issues or remarks"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Closing..." : "Close Shift & Generate Z-Reading"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
