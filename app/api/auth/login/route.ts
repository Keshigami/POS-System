import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pin } = body;

        const user = await prisma.user.findUnique({
            where: { pin },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid PIN" },
                { status: 401 }
            );
        }

        // In a real app, we would set a secure HTTP-only cookie here.
        // For this simple version, we'll just return the user info and handle it on the client.
        // Or better, set a simple cookie.

        const response = NextResponse.json({ user });
        response.cookies.set("pos_session", user.id, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        );
    }
}
