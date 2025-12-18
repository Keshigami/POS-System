import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, type } = body; // type: 'gcash' or 'grab_pay'

        // In a real app, these should be in .env
        const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY || 'sk_test_...'; // Fallback for dev

        // This is a simplified "Source" creation for e-wallets. 
        // For Cards, we'd use Payment Intents. For now, let's assume GCash source.

        // MOCK MODE: If no valid key or explicitly mocking
        if (!PAYMONGO_SECRET.startsWith('sk_')) {
            console.log("Mocking PayMongo Source Creation");
            return NextResponse.json({
                data: {
                    id: `src_mock_${Date.now()}`,
                    attributes: {
                        amount: amount * 100, // cents
                        status: 'pending',
                        redirect: {
                            checkout_url: `https://test-sources.paymongo.com/sources?id=mock`
                        },
                        type: type || 'gcash'
                    }
                }
            });
        }

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Basic ${Buffer.from(PAYMONGO_SECRET).toString('base64')}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        amount: amount * 100, // Amount in centavos
                        redirect: {
                            success: 'http://localhost:3000/payments/success',
                            failed: 'http://localhost:3000/payments/failed'
                        },
                        type: type || 'gcash',
                        currency: 'PHP'
                    }
                }
            })
        };

        const response = await fetch('https://api.paymongo.com/v1/sources', options);
        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error("PayMongo Error:", error);
        return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
    }
}
