"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface OpenShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShiftOpened: () => void;
    userId: string;
    storeId: string;
}

export function OpenShiftModal({ isOpen, onClose, onShiftOpened, userId, storeId }: OpenShiftModalProps) {
    const [startCash, setStartCash] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!startCash || parseFloat(startCash) < 0) {
            alert("Please enter a valid starting cash amount");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startCash: parseFloat(startCash),
                    userId,
                    storeId,
                    notes,
                }),
            });

            if (res.ok) {
                setStartCash("");
                setNotes("");
                onShiftOpened();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to open shift");
            }
        } catch (error) {
            alert("Error opening shift");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Open Shift
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="startCash">Starting Cash (₱) *</Label>
                        <Input
                            id="startCash"
                            type="number"
                            step="0.01"
                            placeholder="5000.00"
                            value={startCash}
                            onChange={(e) => setStartCash(e.target.value)}
                            className="text-lg font-bold"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the amount of cash in the drawer at the start of your shift
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="e.g., Morning shift"
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
                        {loading ? "Opening..." : "Start Shift"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
