"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Loader2, CreditCard, Truck, AlertCircle } from "lucide-react";

interface IntegrationConfig {
    id?: string;
    provider: string;
    type: string;
    enabled: boolean;
    mode: string;
    config?: any;
}

interface ProviderStatus {
    configured: boolean;
    testing: boolean;
    testResult?: { success: boolean; message: string };
}

export default function SettingsPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<"payments" | "delivery">("payments");
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Provider-specific form states
    const [providerStates, setProviderStates] = useState<Record<string, ProviderStatus>>({});
    const [providerConfigs, setProviderConfigs] = useState<Record<string, any>>({});

    const paymentProviders = [
        {
            id: "gcash",
            name: "GCash",
            description: "E-wallet payment via QR code",
            fields: [
                { key: "apiKey", label: "API Key", type: "text", placeholder: "your-gcash-api-key" },
                { key: "merchantId", label: "Merchant ID", type: "text", placeholder: "MERCHANT-123" },
            ],
        },
        {
            id: "maya",
            name: "Maya",
            description: "Maya payment gateway",
            fields: [
                { key: "publicKey", label: "Public Key", type: "text", placeholder: "pk_..." },
                { key: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_..." },
            ],
        },
        {
            id: "paymaya",
            name: "PayMaya",
            description: "PayMaya payment processing",
            fields: [
                { key: "apiKey", label: "API Key", type: "text", placeholder: "pk_..." },
                { key: "apiSecret", label: "API Secret", type: "password", placeholder: "sk_..." },
            ],
        },
    ];

    const deliveryProviders = [
        {
            id: "grabfood",
            name: "GrabFood",
            description: "GrabFood delivery integration",
            fields: [
                { key: "apiKey", label: "API Key", type: "text", placeholder: "your-grabfood-api-key" },
                { key: "storeId", label: "Store ID", type: "text", placeholder: "STORE-123" },
                { key: "webhookSecret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." },
            ],
        },
        {
            id: "foodpanda",
            name: "foodpanda",
            description: "foodpanda delivery integration",
            fields: [
                { key: "apiKey", label: "API Key", type: "text", placeholder: "your-foodpanda-api-key" },
                { key: "vendorId", label: "Vendor ID", type: "text", placeholder: "V-12345" },
            ],
        },
    ];

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            setIntegrations(data);

            // Load detailed configs for each provider
            for (const integration of data) {
                if (integration.enabled) {
                    await loadProviderConfig(integration.provider);
                }
            }
        } catch (error) {
            console.error("Failed to fetch integrations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProviderConfig = async (provider: string) => {
        try {
            const res = await fetch(`/api/settings/${provider}`);
            const data = await res.json();
            if (data.config) {
                setProviderConfigs(prev => ({ ...prev, [provider]: data.config }));
            }
        } catch (error) {
            console.error(`Failed to load ${provider} config:`, error);
        }
    };

    const getIntegration = (provider: string): IntegrationConfig | undefined => {
        return integrations.find(i => i.provider === provider);
    };

    const updateProviderField = (provider: string, field: string, value: string) => {
        setProviderConfigs(prev => ({
            ...prev,
            [provider]: {
                ...(prev[provider] || {}),
                [field]: value,
            },
        }));
    };

    const toggleProvider = async (provider: string, type: string, currentlyEnabled: boolean) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    type,
                    enabled: !currentlyEnabled,
                    mode: "sandbox",
                    config: providerConfigs[provider] || {},
                }),
            });

            if (res.ok) {
                fetchIntegrations();
            }
        } catch (error) {
            console.error("Failed to toggle provider:", error);
        }
    };

    const saveProvider = async (provider: string, type: string) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    type,
                    enabled: true,
                    mode: getIntegration(provider)?.mode || "sandbox",
                    config: providerConfigs[provider] || {},
                }),
            });

            if (res.ok) {
                fetchIntegrations();
                alert("Configuration saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save provider:", error);
            alert("Failed to save configuration");
        }
    };

    const testConnection = async (provider: string) => {
        setProviderStates(prev => ({ ...prev, [provider]: { ...prev[provider], testing: true } }));

        try {
            const res = await fetch(`/api/settings/${provider}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config: providerConfigs[provider] }),
            });

            const result = await res.json();
            setProviderStates(prev => ({
                ...prev,
                [provider]: { ...prev[provider], testing: false, testResult: result },
            }));

            setTimeout(() => {
                setProviderStates(prev => ({
                    ...prev,
                    [provider]: { ...prev[provider], testResult: undefined },
                }));
            }, 5000);
        } catch (error) {
            setProviderStates(prev => ({
                ...prev,
                [provider]: {
                    ...prev[provider],
                    testing: false,
                    testResult: { success: false, message: "Connection test failed" },
                },
            }));
        }
    };

    const toggleMode = async (provider: string) => {
        const integration = getIntegration(provider);
        if (!integration) return;

        const newMode = integration.mode === "sandbox" ? "live" : "sandbox";

        try {
            const res = await fetch(`/api/settings/${provider}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...integration, mode: newMode }),
            });

            if (res.ok) {
                fetchIntegrations();
            }
        } catch (error) {
            console.error("Failed to toggle mode:", error);
        }
    };

    const renderProviderCard = (providerInfo: any, type: "payment" | "delivery") => {
        const integration = getIntegration(providerInfo.id);
        const config = providerConfigs[providerInfo.id] || {};
        const state = providerStates[providerInfo.id] || { configured: false, testing: false };

        return (
            <Card key={providerInfo.id} className="mb-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {providerInfo.name}
                                {integration?.enabled && (
                                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        Active
                                    </span>
                                )}
                                {integration?.mode === "live" && (
                                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                        Live
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription>{providerInfo.description}</CardDescription>
                        </div>
                        <Button
                            variant={integration?.enabled ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleProvider(providerInfo.id, type, integration?.enabled || false)}
                        >
                            {integration?.enabled ? "Disable" : "Enable"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {providerInfo.fields.map((field: any) => (
                        <div key={field.key} className="space-y-2">
                            <Label htmlFor={`${providerInfo.id}-${field.key}`}>{field.label}</Label>
                            <Input
                                id={`${providerInfo.id}-${field.key}`}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={config[field.key] || ""}
                                onChange={(e) => updateProviderField(providerInfo.id, field.key, e.target.value)}
                            />
                        </div>
                    ))}

                    {integration?.enabled && (
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveProvider(providerInfo.id, type)}
                            >
                                Save Configuration
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(providerInfo.id)}
                                disabled={state.testing}
                            >
                                {state.testing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    "Test Connection"
                                )}
                            </Button>
                            <Button
                                variant={integration.mode === "live" ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => toggleMode(providerInfo.id)}
                            >
                                Mode: {integration.mode === "sandbox" ? "Sandbox" : "Live"}
                            </Button>
                        </div>
                    )}

                    {state.testResult && (
                        <div
                            className={`flex items-center gap-2 p-3 rounded-md ${state.testResult.success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                        >
                            {state.testResult.success ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                            <span className="text-sm">{state.testResult.message}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-muted-foreground">Configure payment gateways and delivery integrations</p>
                    </div>
                </div>

                {/* Info Banner */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="flex items-start gap-3 pt-6">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium">Sandbox Mode</p>
                            <p className="text-blue-700">
                                All integrations start in Sandbox mode for safe testing. Switch to Live mode when you're ready to process real transactions.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeSection === "payments"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setActiveSection("payments")}
                    >
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Gateways
                        </div>
                    </button>
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${activeSection === "delivery"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setActiveSection("delivery")}
                    >
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Delivery Platforms
                        </div>
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div>
                        {activeSection === "payments" && (
                            <div>
                                {paymentProviders.map(provider => renderProviderCard(provider, "payment"))}
                            </div>
                        )}

                        {activeSection === "delivery" && (
                            <div>
                                {deliveryProviders.map(provider => renderProviderCard(provider, "delivery"))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
