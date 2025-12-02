import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // Fetch the user from DB to get the storeId (since it might not be on the 'user' object from the adapter immediately if not configured)
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
                session.user.storeId = dbUser?.storeId || null;
                session.user.role = dbUser?.role || "STAFF";
            }
            return session
        },
        async signIn({ user, account, profile }) {
            // Optional: Restrict to specific domains if needed
            // if (profile?.email?.endsWith("@example.com")) return true
            return true
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string as ?error=
    },
    session: {
        strategy: "database",
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
