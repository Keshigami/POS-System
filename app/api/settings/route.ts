import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all integration configs (sanitized)
export async function GET() {
    try {
        const configs = await prisma.integrationConfig.findMany({
            select: {
                id: true,
                provider: true,
                type: true,
                enabled: true,
                mode: true,
                createdAt: true,
                updatedAt: true,
                // Do NOT return config (contains sensitive API keys)
            },
        });

        return NextResponse.json(configs);
    } catch (error) {
        console.error("Failed to fetch integration configs:", error);
        return NextResponse.json(
            { error: "Failed to fetch integrations" },
            { status: 500 }
        );
    }
}

// POST - Create or update integration config
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { provider, type, enabled, mode, config } = body;

        if (!provider || !type) {
            return NextResponse.json(
                { error: "Provider and type are required" },
                { status: 400 }
            );
        }

        // Upsert (create or update if exists)
        const integration = await prisma.integrationConfig.upsert({
            where: { provider },
            update: {
                enabled,
                mode,
                config: JSON.stringify(config), // Store as JSON string
            },
            create: {
                provider,
                type,
                enabled: enabled || false,
                mode: mode || "sandbox",
                config: JSON.stringify(config),
            },
        });

        return NextResponse.json({
            id: integration.id,
            provider: integration.provider,
            type: integration.type,
            enabled: integration.enabled,
            mode: integration.mode,
        });
    } catch (error) {
        console.error("Failed to save integration config:", error);
        return NextResponse.json(
            { error: "Failed to save integration" },
            { status: 500 }
        );
    }
}
