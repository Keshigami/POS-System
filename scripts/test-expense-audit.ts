
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Starting Expense Audit Test...");

    // 1. Setup Data
    const store = await prisma.store.create({ data: { name: "Exp Test Store" } });

    // 2. Create Expense with new fields
    console.log("Creating Expense...");
    const expense = await prisma.expense.create({
        data: {
            amount: 500,
            category: "Supplies",
            storeId: store.id,
            notes: "Paper rolls",
            paymentMethod: "GCASH",
            userId: undefined // Optional, simulating system or unknown user for now
        }
    });

    console.log(`Created Expense: ${expense.id}, Method: ${expense.paymentMethod}`);

    // 3. Verify
    const fetched = await prisma.expense.findUnique({ where: { id: expense.id } });

    if (fetched?.paymentMethod !== "GCASH") {
        console.error("❌ Payment Method mismatch");
        process.exit(1);
    } else {
        console.log("✅ Expense created with Audit fields.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
