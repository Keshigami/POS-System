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
    Sun,
    Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";

export function NavigationSidebar() {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <aside className="w-16 md:w-20 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col items-center py-4 gap-4 z-50 h-full shadow-sm">
            {/* Logo */}
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl mb-2 shadow-sm border-2 border-primary">
                P
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col gap-2 w-full px-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/inventory")}
                    title="Inventory"
                >
                    <PackageIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/customers")}
                    title="Customers"
                >
                    <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/suppliers")}
                    title="Suppliers"
                >
                    <Truck className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/purchase-orders")}
                    title="Purchase Orders"
                >
                    <PackageOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/expenses")}
                    title="Expenses"
                >
                    <Wallet className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/transactions")}
                    title="History"
                >
                    <History className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 w-full px-2 mt-auto">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={toggleTheme}
                    title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {resolvedTheme === 'dark' ? (
                        <Sun className="h-6 w-6 text-yellow-500" />
                    ) : (
                        <Moon className="h-6 w-6 text-gray-600" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg"
                    onClick={() => router.push("/settings")}
                    title="Settings"
                >
                    <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-14 min-h-[56px] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                    title="Logout"
                >
                    <LogOut className="h-6 w-6" />
                </Button>
            </div>
        </aside>
    );
}
