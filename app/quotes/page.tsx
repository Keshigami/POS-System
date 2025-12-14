"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Trash2, Printer, FileText, ShoppingCart } from "lucide-react";
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
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Quote {
    id: string;
    quoteNumber: number;
    customer: { name: string } | null;
    customerName: string | null;
    total: number;
    status: string;
    createdAt: string;
    items: any[];
    _count: { items: number };
}

export default function QuotesPage() {
    const router = useRouter();
    const { data: quotes, error } = useSWR<Quote[]>("/api/quotes", fetcher);
    const [search, setSearch] = useState("");

    const filteredQuotes = quotes?.filter((q) => {
        const s = search.toLowerCase();
        return (
            (q.quoteNumber?.toString().includes(s)) ||
            (q.customerName?.toLowerCase().includes(s)) ||
            (q.customer?.name.toLowerCase().includes(s)) ||
            (q.status.toLowerCase().includes(s))
        );
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quote?")) return;
        try {
            await fetch(`/api/quotes/${id}`, { method: "DELETE" });
            mutate("/api/quotes");
        } catch (e) {
            alert("Failed to delete quote");
        }
    };

    const handleLoadToPOS = (quote: Quote) => {
        router.push(`/?loadQuote=${quote.id}`);
    };

    if (error) return <div>Failed to load quotes</div>;
    if (!quotes) return <div>Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Quotations
                </h1>
                <Button onClick={() => router.push("/")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New (Go to POS)
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search quotes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quote #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotes?.map((quote) => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-mono">#{quote.quoteNumber}</TableCell>
                                <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{quote.customer?.name || quote.customerName || "Walk-in"}</TableCell>
                                <TableCell>{quote._count.items}</TableCell>
                                <TableCell className="text-right font-bold">
                                    ₱{quote.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={quote.status === "PENDING" ? "default" : "secondary"}>
                                        {quote.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" title="Load to POS" onClick={() => handleLoadToPOS(quote)}>
                                        <ShoppingCart className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Print" onClick={() => window.print()}>
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleDelete(quote.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
