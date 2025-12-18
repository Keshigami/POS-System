"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/auth";

interface LoginFormProps {
    onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [credentials, setCredentials] = useState({
        username: "",
        pin: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            onLogin(data.user);
            // Reload page to update authentication state
            window.location.reload();
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <Input
                        id="username"
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        className="mt-1 block w-full"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                        PIN
                    </label>
                    <Input
                        id="pin"
                        type="password"
                        value={credentials.pin}
                        onChange={(e) => setCredentials(prev => ({ ...prev, pin: e.target.value }))}
                        className="mt-1 block w-full"
                        required
                        maxLength={4}
                    />
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}
