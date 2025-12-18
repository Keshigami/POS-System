"use client";

import {
    LayoutDashboard,
    Search,
    Users,
    Clock,
    UserCheck,
    Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useRouter } from "next/navigation"; // Unused now
import { Customer } from "@/types/pos";

interface POSHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentShift: any | null;
    onOpenShift: () => void;
    onCloseShift: () => void;
    autoPrintEnabled: boolean;
    setAutoPrintEnabled: (enabled: boolean) => void;
    selectedCustomer: Customer | null;
    onCustomerSelectClick: () => void;
}

export function POSHeader({
    searchQuery,
    setSearchQuery,
    currentShift,
    onOpenShift,
    onCloseShift,
    autoPrintEnabled,
    setAutoPrintEnabled,
    selectedCustomer,
    onCustomerSelectClick
}: POSHeaderProps) {
    // const router = useRouter(); // Unused

    return (
        <>
            <header className="border-b bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
                {/* Logo removed (moved to sidebar) */}

                <div className="flex items-center gap-4 flex-1 max-w-xl mx-auto">
                    {/* Customer Selector Button */}
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

                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products... (F4)"
                            className="pl-8 bg-gray-100 dark:bg-gray-900 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            id="product-search"
                        />
                    </div>
                </div>

                {/* Right side Nav Icons removed (moved to sidebar) */}
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
                    >
                        <Printer className="h-3 w-3 mr-1" /> Auto Print
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
            </div>
        </>
    );
}
