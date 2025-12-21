import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";

        const where: any = {};

        if (search) {
            where.notes = { contains: search };
        }

        if (category) {
            where.category = category;
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                store: true
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, category, notes, date, storeId, userId, paymentMethod } = body;

        if (!amount || !category || !storeId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                category,
                notes,
                date: date ? new Date(date) : new Date(),
                storeId,
                userId, // Optional
                paymentMethod: paymentMethod || "CASH"
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}
