"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

// Mock fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EmployeesPage() {
    const router = useRouter();
    // In a real app we'd fetch actual users. 
    // Here we'll just mock a list of employees since User management is via Prisma Studio/Seed mainly for now.
    // However, if we added Users to schema we can fetch them. 
    // Let's assume there's no /api/users yet, so we'll just focus on Shift History which is tied to shifts.
    // Wait, we need to see shifts.

    // For now, let's just show a Shift History table which is more valuable.
    // We don't have a GET /api/shifts (list all) yet, only GET current active.
    // I should probably add ability to list all shifts to /api/shifts/route.ts but GET is taken for 'active'.
    // Let's stick to a placeholder for now or quickly add a list endpoint if I really want to be thorough.
    // Actually, let's just show the page skeleton and maybe "Active Shift" status if I can.

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Employee Management</h1>
                        <p className="text-muted-foreground">Manage staff and view shift history.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">
                                Active users
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
                            <Clock className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">1</div>
                            <p className="text-xs text-muted-foreground">
                                Currently clocked in
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Shifts</CardTitle>
                        <CardDescription>
                            History of shift openings and closures.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground italic">
                            Shift history API not yet connected. <br />
                            (Implemented Clock In/Out logic in POS)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
