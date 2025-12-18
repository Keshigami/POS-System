export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    hasVariants?: boolean;
    variants?: any[];
    barcode?: string;
    reorderPoint?: number;
    emoji?: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Package {
    id: string;
    name: string;
    description?: string;
    price: number;
    items: {
        product: Product;
        quantity: number;
    }[];
}

export interface CartItem extends Product {
    quantity: number;
    isPackage?: boolean;
    variantId?: string;
    variantName?: string;
}

export type DiscountType = "NONE" | "SENIOR_CITIZEN" | "PWD";

export type PaymentMethod = "CASH" | "CARD" | "GCASH" | "MAYA" | "SPLIT" | "CREDIT" | "GIFT_CARD" | "LOYALTY_POINTS";

export interface Customer {
    id: string;
    name: string;
    pointsBalance: number;
    totalDebt: number;
    creditLimit?: number;
}
