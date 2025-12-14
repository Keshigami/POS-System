"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Delete, Check } from "lucide-react";

interface NumpadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    initialValue?: string;
}

export function NumpadModal({ isOpen, onClose, onConfirm, title, initialValue = "" }: NumpadModalProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);

    const handleNumberClick = (num: string) => {
        if (value === "0" && num !== ".") {
            setValue(num);
        } else {
            setValue(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        setValue(prev => prev.slice(0, -1) || "0");
    };

    const handleClear = () => {
        setValue("0");
    };

    const handleConfirm = () => {
        onConfirm(value);
        onClose();
    };

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="text-3xl font-bold text-center p-4 bg-muted rounded-md border">
                        {value || "0"}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {keys.map((key) => (
                            <Button
                                key={key}
                                variant="outline"
                                className="h-16 text-2xl font-bold"
                                onClick={() => handleNumberClick(key)}
                            >
                                {key}
                            </Button>
                        ))}
                        <Button
                            variant="destructive"
                            className="h-16"
                            onClick={handleBackspace}
                        >
                            <Delete className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-12" onClick={handleClear}>Clear</Button>
                        <Button className="h-12 bg-green-600 hover:bg-green-700 text-lg" onClick={handleConfirm}>
                            <Check className="h-5 w-5 mr-2" /> Enter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
