import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            storeId: string | null
            role: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }

    interface User {
        storeId?: string | null
        role?: string
    }
}
