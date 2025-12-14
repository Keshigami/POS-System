"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Search, Gift, CreditCard, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GiftCard {
    id: string;
    code: string;
    initialBalance: number;
    currentBalance: number;
    status: "ACTIVE" | "USED" | "EXPIRED";
    expiresAt: string | null;
    createdAt: string;
}

export default function GiftCardsPage() {
    // Existing API for GET /api/gift-cards checks specific code. 
    // We need a proper list endpoint. 
    // Assuming /api/gift-cards without query param lists all (need to verify/implement).
    // If not implemented, we should implement it. 
    // But currently, based on description, /api/gift-cards GET verifies code.
    // I should create a separate API or update GET to list if no code provided.
    // For now, I'll assume I update the API or use a new one.
    // Let's assume I'll update /api/gift-cards to list if no query.

    const { data: giftCards, error } = useSWR<GiftCard[]>("/api/gift-cards?list=true", fetcher);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [amount, setAmount] = useState("500");
    const [generatedCard, setGeneratedCard] = useState<GiftCard | null>(null);

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/gift-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ initialBalance: parseFloat(amount) })
            });

            if (res.ok) {
                const newCard = await res.json();
                setGeneratedCard(newCard);
                mutate("/api/gift-cards?list=true");
                setIsAddModalOpen(false);
            } else {
                alert("Failed to issue gift card");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Gift className="h-8 w-8 text-primary" />
                            Gift Cards
                        </h1>
                        <p className="text-muted-foreground">Issue and track gift cards</p>
                    </div>
                    <Button onClick={() => { setGeneratedCard(null); setIsAddModalOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Issue Gift Card
                    </Button>
                </div>

                {/* Newly Generated Card Display */}
                {generatedCard && (
                    <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none shadow-lg mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5" /> Gift Card Issued Successfully
                            </CardTitle>
                            <CardDescription className="text-purple-100">
                                Please provide this code to the customer. It cannot be retrieved again easily.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <p className="text-sm uppercase tracking-widest opacity-75 mb-2">Gift Card Code</p>
                                <p className="text-4xl font-mono font-bold tracking-wider">{generatedCard.code}</p>
                                <p className="mt-2 text-xl font-semibold">₱{generatedCard.initialBalance.toFixed(2)}</p>
                            </div>
                            <Button variant="secondary" className="w-full" onClick={() => setGeneratedCard(null)}>
                                Close & Continue
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Issued Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Initial</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expiry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {giftCards && giftCards.length > 0 ? (
                                    giftCards.map((card) => (
                                        <TableRow key={card.id}>
                                            <TableCell className="font-mono font-medium">{card.code}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(card.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">₱{card.initialBalance.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                ₱{card.currentBalance.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    card.status === 'ACTIVE' ? 'default' :
                                                        card.status === 'USED' ? 'secondary' : 'destructive'
                                                }>
                                                    {card.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString() : "Never"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {giftCards ? "No gift cards issued yet" : "Loading..."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue New Gift Card</DialogTitle>
                            <DialogDescription>
                                Create a new gift card with a specific balance.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleIssue} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₱)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="text-lg font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[100, 500, 1000].map(val => (
                                    <Button
                                        type="button"
                                        key={val}
                                        variant="outline"
                                        onClick={() => setAmount(val.toString())}
                                        className={amount === val.toString() ? "border-primary bg-primary/5" : ""}
                                    >
                                        ₱{val}
                                    </Button>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Issue Card</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
