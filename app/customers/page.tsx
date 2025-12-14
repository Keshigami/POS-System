"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Search, User, Phone, Wallet, CreditCard, DollarSign } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    contact: string | null;
    totalDebt: number;
    creditLimit: number | null;
    pointsBalance: number;
    notes: string | null;
}

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        contact: "",
        creditLimit: "",
        notes: ""
    });

    // Debt Payment State
    const [isPayDebtOpen, setIsPayDebtOpen] = useState(false);
    const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState<Customer | null>(null);
    const [debtPaymentAmount, setDebtPaymentAmount] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`/ api / customers ? query = ${searchQuery} `);
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCustomer.name,
                    contact: newCustomer.contact,
                    creditLimit: newCustomer.creditLimit ? parseFloat(newCustomer.creditLimit) : null,
                    notes: newCustomer.notes
                })
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewCustomer({ name: "", contact: "", creditLimit: "", notes: "" });
                fetchCustomers();
            } else {
                alert("Failed to create customer");
            }
        } catch (error) {
            console.error("Error creating customer:", error);
        }
    };

    const handlePayDebt = async () => {
        if (!selectedCustomerForDebt || !debtPaymentAmount || parseFloat(debtPaymentAmount) <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        try {
            const res = await fetch(`/ api / customers / ${selectedCustomerForDebt.id}/pay-debt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(debtPaymentAmount) })
            });

            if (res.ok) {
                setIsPayDebtOpen(false);
                setDebtPaymentAmount("");
                setSelectedCustomerForDebt(null);
                fetchCustomers(); // Refresh customer list
            } else {
                const errorData = await res.json();
                alert(`Failed to record payment: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Error recording debt payment:", error);
            alert("An unexpected error occurred while recording payment.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push("/")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
                            <p className="text-muted-foreground">Manage customers and credit ledgers</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Customer
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <form onSubmit={handleSearch} className="relative max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or number..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Total Debt</TableHead>
                                        <TableHead className="text-right">Points</TableHead>
                                        <TableHead className="text-right">Credit Limit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    ) : customers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No customers found</TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map((customer, index) => (
                                            <TableRow key={customer.id} className="hover:bg-muted/50">
                                                <TableCell className="text-muted-foreground w-12">{index + 1}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        {customer.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{customer.contact || "-"}</TableCell>
                                                <TableCell className="text-right font-bold text-red-600">
                                                    {customer.totalDebt > 0 ? `₱${customer.totalDebt.toFixed(2)}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-purple-600">
                                                    {customer.pointsBalance}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {customer.creditLimit ? `₱${customer.creditLimit.toFixed(2)}` : "No Limit"}
                                                </TableCell>
                                                <TableCell>
                                                    {customer.creditLimit && customer.totalDebt >= customer.creditLimit ? (
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">Maxed Out</span>
                                                    ) : customer.totalDebt > 0 ? (
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">Has Debt</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">Good Standing</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Future: View History
                                                            router.push(`/customers/${customer.id}`);
                                                        }}>View</Button>
                                                        {customer.totalDebt > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click
                                                                    setSelectedCustomerForDebt(customer);
                                                                    setIsPayDebtOpen(true);
                                                                }}
                                                            >
                                                                <DollarSign className="h-3 w-3 mr-1" />
                                                                Pay Debt
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Number</Label>
                                <Input
                                    id="contact"
                                    value={newCustomer.contact}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creditLimit">Credit Limit (Optional)</Label>
                                <Input
                                    id="creditLimit"
                                    type="number"
                                    step="0.01"
                                    placeholder="Leave blank for no limit"
                                    value={newCustomer.creditLimit}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={newCustomer.notes}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Customer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Pay Debt Modal */}
                <Dialog open={isPayDebtOpen} onOpenChange={setIsPayDebtOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Debt Payment</DialogTitle>
                            <DialogDescription>
                                Payment for {selectedCustomerForDebt?.name}. Current Debt: ₱{selectedCustomerForDebt?.totalDebt?.toFixed(2)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentAmount">Payment Amount</Label>
                                <Input
                                    id="paymentAmount"
                                    type="number"
                                    step="0.01"
                                    value={debtPaymentAmount}
                                    onChange={(e) => setDebtPaymentAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPayDebtOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handlePayDebt} className="bg-green-600 hover:bg-green-700">Confirm Payment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
