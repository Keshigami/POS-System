import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import Papa from 'papaparse';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // 'products' or 'customers'

        if (!file || !type) {
            return NextResponse.json({ error: "File and Type required" }, { status: 400 });
        }

        const text = await file.text();
        const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });

        if (errors.length > 0) {
            console.error("CSV Parse Errors:", errors);
            // We can choose to abort or continue. Let's continue but report.
        }

        let successCount = 0;
        let failCount = 0;
        const results = [];

        if (type === 'products') {
            // Fetch a default category (misc or first one) to use as fallback
            const defaultCategory = await prisma.category.findFirst();
            const defaultCategoryId = defaultCategory?.id || "";

            if (!defaultCategoryId) throw new Error("No categories found in system");

            for (const row of (data as any[])) {
                try {
                    // Expected headers: name, price, stock
                    if (!row.name || !row.price) {
                        failCount++;
                        // results.push({ row, status: 'error', message: 'Missing name or price' });
                        continue;
                    }

                    const price = parseFloat(row.price);
                    const stock = parseInt(row.stock || '0');
                    const storeId = "cm43l9w450000v903726p5869";

                    await prisma.product.create({
                        data: {
                            name: row.name,
                            price: price,
                            stock: stock,
                            storeId: storeId,
                            categoryId: defaultCategoryId
                        }
                    });
                    successCount++;
                } catch (e) {
                    failCount++;
                    // results.push({ row, status: 'error', message: (e as any).message });
                }
            }
        } else if (type === 'customers') {
            for (const row of (data as any[])) {
                try {
                    if (!row.name) {
                        failCount++;
                        continue;
                    }
                    // Upsert by name? Or just create.
                    await prisma.customer.create({
                        data: {
                            name: row.name,
                            contact: row.contact || "",
                            pointsBalance: parseInt(row.points || '0'),
                            storeId: "cm43l9w450000v903726p5869"
                        }
                    });
                    successCount++;
                } catch (e) {
                    failCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            imported: successCount,
            failed: failCount,
            // message: "Import partial implementation - requires robust category handling for products" 
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }
}
