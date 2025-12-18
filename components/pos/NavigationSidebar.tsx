"use client";

import {
    LogOut,

    Settings,
    History,
    PackageOpen,
    Users,
    Wallet,
    Truck,
    Package as PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function NavigationSidebar() {
    const router = useRouter();

    return (
        <aside className="w-16 md:w-20 bg-white dark:bg-gray-800 border-r flex flex-col items-center py-4 gap-4 z-50 h-full shadow-sm">
            {/* Logo */}
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl mb-2 shadow-sm">
                P
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col gap-2 w-full px-2">
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/inventory")} title="Inventory">
                    <PackageIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/customers")} title="Customers">
                    <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/suppliers")} title="Suppliers">
                    <Truck className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/purchase-orders")} title="Purchase Orders">
                    <PackageOpen className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/expenses")} title="Expenses">
                    <Wallet className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/transactions")} title="History">
                    <History className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 w-full px-2 mt-auto">
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push("/settings")} title="Settings">
                    <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full h-12 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700" title="Logout">
                    <LogOut className="h-6 w-6" />
                </Button>
            </div>
        </aside>
    );
}
