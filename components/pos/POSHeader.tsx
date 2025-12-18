"use client";

import {
    Search,
    Users,
    Clock,
    Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types/pos";

interface Shift {
    id: string;
    startTime: string;
    endTime?: string;
    userId: string;
    isActive: boolean;
}

interface POSHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentShift: Shift | null;
    onOpenShift: () => void;
    onCloseShift: () => void;
    autoPrintEnabled: boolean;
    setAutoPrintEnabled: (enabled: boolean) => void;
    selectedCustomer: Customer | null;
    onCustomerSelectClick: () => void;
    onLogout: () => void;
}

function POSHeader({
    searchQuery,
    setSearchQuery,
    currentShift,
    onOpenShift,
    onCloseShift,
    autoPrintEnabled,
    setAutoPrintEnabled,
    selectedCustomer,
    onCustomerSelectClick,
    onLogout
}: POSHeaderProps) {
    return (
        <>
            <header className="border-b bg-white px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4 flex-1 max-w-xl mx-auto">
                    <Button
                        variant={selectedCustomer ? "default" : "outline"}
                        className="gap-2 min-w-[140px] truncate"
                        onClick={onCustomerSelectClick}
                    >
                        <Users className="h-4 w-4" />
                        <span className="truncate max-w-[120px]">
                            {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                        </span>
                    </Button>
                    {onLogout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="text-xs h-8"
                        >
                            Logout
                        </Button>
                    )}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products... (F4)"
                        className="pl-8 bg-gray-100 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="product-search"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={autoPrintEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            const newValue = !autoPrintEnabled;
                            setAutoPrintEnabled(newValue);
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('pos-auto-print', newValue.toString());
                            }
                        }}
                        className="text-xs h-8"
                        title={autoPrintEnabled ? "Disable Auto Print" : "Enable Auto Print"}
                    >
                        <Printer className="h-3 w-3" /> {autoPrintEnabled ? "Disable Auto Print" : "Enable Auto Print"}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {currentShift ? (
                        <>
                            <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                <Clock className="h-3 w-3 mr-1" /> Shift Open
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={onCloseShift}
                                className="text-xs h-8"
                            >
                                Close Shift
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-bold text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                <Clock className="h-3 w-3 mr-1" /> Shift Closed
                            </span>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                onClick={onOpenShift}
                            >
                                Open Shift
                            </Button>
                        </>
                    )}
                </div>
            </header>
        </>
    );
}

export { POSHeader };
