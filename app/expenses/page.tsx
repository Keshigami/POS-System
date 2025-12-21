"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, DollarSign, Calendar, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Expense {
    id: string;
    amount: number;
    category: string;
    notes: string;
    date: string;
}

const CATEGORIES = [
    "Rent",
    "Utilities",
    "Salaries",
    "Supplies",
    "Maintenance",
    "Transportation",
    "Marketing",
    "Other"
];

export default function ExpensesPage() {
    const { data: expenses, error } = useSWR<Expense[]>("/api/expenses", fetcher);

    // State
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    // Filter Logic
    const filteredExpenses = expenses?.filter((e) => {
        const s = search.toLowerCase();
        return (
            (e.category.toLowerCase().includes(s)) ||
            (e.notes?.toLowerCase().includes(s))
        );
    });

    const handleCreate = async () => {
        if (!amount || !category) {
            alert("Please enter amount and category");
            return;
        }

        // Hardcode storeId or fetch properly. 
        // We'll use a placeholder store ID or fetch list of stores.
        // Assuming the API might need a storeId. 
        // Let's rely on finding a store or creating a new one if none exists in API,
        // or just hardcoding one from the previous context (which we don't have easily).
        // Let's fail-safe by fetching suppliers to get a valid storeId (hacky but works)
        // or just fetch /api/shifts to find current user's store?
        // Let's try to pass a known store ID from the first expense? No expenses yet.
        // Let's just fetch suppliers and grab the first one's storeId, same trick.

        let storeId;
        try {
            const suppliersRes = await fetch("/api/suppliers");
            const suppliers = await suppliersRes.json();
            if (suppliers && suppliers.length > 0) {
                storeId = suppliers[0].storeId;
            } else {
                // If no suppliers, maybe fetch categories?
                const catRes = await fetch("/api/categories");
                const cats = await catRes.json();
                if (cats && cats.length > 0) storeId = cats[0].storeId;
            }
        } catch (e) {
            console.error("Failed to find store ID");
        }

        if (!storeId) {
            alert("Could not determine Store ID. Please ensure system is initialized (add a category or supplier first).");
            return;
        }

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    category,
                    notes,
                    date,
                    storeId,
                    paymentMethod // Added field
                })
            });

            if (res.ok) {
                mutate("/api/expenses");
                setIsCreateOpen(false);
                setAmount("");
                setCategory("");
                setNotes("");
                setPaymentMethod("CASH");
                alert("Expense logged!");
            } else {
                alert("Failed to log expense");
            }
        } catch (e) {
            console.error(e);
            alert("Error logging expense");
        }
    };

    if (error) return <div>Failed to load expenses</div>;
    if (!expenses) return <div>Loading...</div>;

    const totalExpenses = filteredExpenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Wallet className="h-8 w-8" />
                    Expenses
                </h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Plus className="h-4 w-4 mr-2" />
                            Log Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log New Expense</DialogTitle>
                            <DialogDescription>Record a business expense.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Amount</Label>
                                <Input
                                    type="number"
                                    className="col-span-3"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Payment Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash (Drawer)</SelectItem>
                                        <SelectItem value="GCASH">GCash</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date</Label>
                                <Input
                                    type="date"
                                    className="col-span-3"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Notes</Label>
                                <Input
                                    className="col-span-3"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Description..."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} variant="destructive">Log Expense</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-destructive">₱{totalExpenses.toFixed(2)}</p>
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses?.map((e) => (
                            <TableRow key={e.id}>
                                <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{e.category}</Badge>
                                </TableCell>
                                <TableCell>{e.notes}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs">{(e as any).paymentMethod || "CASH"}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-destructive">
                                    -₱{e.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
