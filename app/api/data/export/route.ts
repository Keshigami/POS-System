import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import Papa from 'papaparse';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'products' | 'customers'

    if (!type) return NextResponse.json({ error: "Type required" }, { status: 400 });

    try {
        let data = [];
        if (type === 'products') {
            data = await prisma.product.findMany({
                select: {
                    name: true,
                    price: true,
                    stock: true,
                    description: true,
                    // category: { select: { name: true } } // flattening is needed for simple CSV
                }
            });
            // formatting
            data = data.map((p: any) => ({
                name: p.name,
                price: p.price,
                stock: p.stock,
                description: p.description
            }));
        } else if (type === 'customers') {
            data = await prisma.customer.findMany({
                select: {
                    name: true,
                    contact: true,
                    pointsBalance: true,
                    totalDebt: true
                }
            });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const csv = Papa.unparse(data);

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${type}_export.csv"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
