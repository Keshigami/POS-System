"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_TYPES, BUSINESS_TYPE_INFO, BusinessType } from "@/lib/business-types";

export default function SetupPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (type: BusinessType) => {
        setLoading(true);
        try {
            // 1. Update the store's business type
            const storeRes = await fetch('/api/store/business-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessType: type }),
            });

            if (!storeRes.ok) {
                throw new Error('Failed to set business type');
            }

            // 2. Seed database with business-type-specific data
            const seedRes = await fetch('/api/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessType: type }),
            });

            if (!seedRes.ok) {
                throw new Error('Failed to seed database');
            }

            // 3. Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Error during setup:', error);
            alert('An error occurred during setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
            <div className="max-w-5xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Welcome to Your POS System! 👋
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Let's personalize your experience. What type of SME business are you running?
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.values(BUSINESS_TYPES).map((type) => {
                        const info = BUSINESS_TYPE_INFO[type];
                        const isSelected = selectedType === type;

                        return (
                            <Card
                                key={type}
                                className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''
                                    }`}
                                onClick={() => setSelectedType(type)}
                            >
                                <CardHeader className="text-center">
                                    <div className="text-6xl mb-4">{info.icon}</div>
                                    <CardTitle className="text-xl">{info.name}</CardTitle>
                                    <CardDescription>{info.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Default Categories:
                                        </p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {info.categories.slice(0, 4).map((cat, idx) => (
                                                <li key={idx}>• {cat}</li>
                                            ))}
                                            {info.categories.length > 4 && (
                                                <li>• +{info.categories.length - 4} more</li>
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => handleSelect(BUSINESS_TYPES.GENERAL)}
                        disabled={loading}
                    >
                        Skip for now
                    </Button>
                    <Button
                        onClick={() => selectedType && handleSelect(selectedType)}
                        disabled={!selectedType || loading}
                        size="lg"
                    >
                        {loading ? 'Setting up...' : 'Continue →'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
