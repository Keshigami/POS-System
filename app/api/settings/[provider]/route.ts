import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET specific integration config
export async function GET(
    request: Request,
    { params }: { params: { provider: string } }
) {
    try {
        const config = await prisma.integrationConfig.findUnique({
            where: { provider: params.provider },
        });

        if (!config) {
            return NextResponse.json(
                { error: "Integration not found" },
                { status: 404 }
            );
        }

        // Parse config JSON
        const configData = config.config ? JSON.parse(config.config) : {};

        return NextResponse.json({
            id: config.id,
            provider: config.provider,
            type: config.type,
            enabled: config.enabled,
            mode: config.mode,
            config: configData, // Return parsed config
        });
    } catch (error) {
        console.error("Failed to fetch integration config:", error);
        return NextResponse.json(
            { error: "Failed to fetch integration" },
            { status: 500 }
        );
    }
}

// PUT - Update integration
export async function PUT(
    request: Request,
    { params }: { params: { provider: string } }
) {
    try {
        const body = await request.json();
        const { enabled, mode, config } = body;

        const integration = await prisma.integrationConfig.update({
            where: { provider: params.provider },
            data: {
                enabled,
                mode,
                config: config ? JSON.stringify(config) : undefined,
            },
        });

        return NextResponse.json({
            id: integration.id,
            provider: integration.provider,
            enabled: integration.enabled,
            mode: integration.mode,
        });
    } catch (error) {
        console.error("Failed to update integration:", error);
        return NextResponse.json(
            { error: "Failed to update integration" },
            { status: 500 }
        );
    }
}

// DELETE - Remove integration
export async function DELETE(
    request: Request,
    { params }: { params: { provider: string } }
) {
    try {
        await prisma.integrationConfig.delete({
            where: { provider: params.provider },
        });

        return NextResponse.json({ message: "Integration deleted" });
    } catch (error) {
        console.error("Failed to delete integration:", error);
        return NextResponse.json(
            { error: "Failed to delete integration" },
            { status: 500 }
        );
    }
}

// POST - Test connection (mock for now)
export async function POST(
    request: Request,
    { params }: { params: { provider: string } }
) {
    try {
        const body = await request.json();
        const { config } = body;

        // Mock test - in real implementation, this would test actual API connection
        const testResult = {
            success: true,
            message: `Successfully connected to ${params.provider} (Mock Mode)`,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(testResult);
    } catch (error) {
        console.error("Connection test failed:", error);
        return NextResponse.json(
            { success: false, message: "Connection test failed" },
            { status: 500 }
        );
    }
}
