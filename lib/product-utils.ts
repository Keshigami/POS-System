export const getProductImage = (productName: string, categoryName: string) => {
    // Specific Product Validated Images (Unsplash)
    const PRODUCT_IMAGES: Record<string, string> = {
        // Coffee
        "espresso": "https://images.unsplash.com/photo-1510591509098-f4fd96ca65a8?auto=format&fit=crop&w=400&q=80",
        "americano": "https://images.unsplash.com/photo-1551030173-122fca94d6e6?auto=format&fit=crop&w=400&q=80",
        "latte": "https://images.unsplash.com/photo-1461023058943-716c7f1a0475?auto=format&fit=crop&w=400&q=80",
        "cappuccino": "https://images.unsplash.com/photo-1572442388796-11668a67e569?auto=format&fit=crop&w=400&q=80",
        "macchiato": "https://images.unsplash.com/photo-1485808191679-5f8c7c860695?auto=format&fit=crop&w=400&q=80",
        "mocha": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=400&q=80",
        // Pastry
        "croissant": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80",
        "pain au chocolat": "https://images.unsplash.com/photo-1626015565291-64d632b83649?auto=format&fit=crop&w=400&q=80",
        "bagel": "https://images.unsplash.com/photo-1585478683058-772eb78c6b12?auto=format&fit=crop&w=400&q=80",
        "cookie": "https://images.unsplash.com/photo-1499636138143-bd99cb65fbb9?auto=format&fit=crop&w=400&q=80",
        "muffin": "https://images.unsplash.com/photo-1558303420-f814d8a590f5?auto=format&fit=crop&w=400&q=80",
        // Meals (Silog / Rice)
        "tapsilog": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
        "tocilog": "https://images.unsplash.com/photo-1533089862017-5614ecd6d0d8?auto=format&fit=crop&w=400&q=80",
        "longsilog": "https://images.unsplash.com/photo-1567333120614-7ee4a169b59e?auto=format&fit=crop&w=400&q=80",
        "bangus": "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=400&q=80",
        "sisig": "https://images.unsplash.com/photo-1601356616077-6950280170a4?auto=format&fit=crop&w=400&q=80",
        "chicken": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=400&q=80",
        "pork": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80",
        // Beverages
        "coke": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
        "coca-cola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
        "sprite": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80",
        "royal": "https://images.unsplash.com/photo-1530272016335-ad68d9047395?auto=format&fit=crop&w=400&q=80", // Orange soda
        "tea": "https://images.unsplash.com/photo-1499638634363-3158485e8d5e?auto=format&fit=crop&w=400&q=80",
        "juice": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
        "water": "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=400&q=80",
        "beer": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80",
        "san mig": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80",
    };

    const lowerName = productName.toLowerCase();

    // Check for specific product lookup (partial match)
    const matchedKey = Object.keys(PRODUCT_IMAGES).find(key => lowerName.includes(key));
    if (matchedKey) return PRODUCT_IMAGES[matchedKey];

    // Fallback to Category
    const lowerCat = categoryName.toLowerCase();
    if (lowerCat.includes("coffee") || lowerCat.includes("latte")) return "https://images.unsplash.com/photo-1461023058943-716c7f1a0475?auto=format&fit=crop&w=400&q=80";
    if (lowerCat.includes("pastry") || lowerCat.includes("bread")) return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80";
    if (lowerCat.includes("meal") || lowerCat.includes("rice") || lowerCat.includes("silog")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80";
    if (lowerCat.includes("drink") || lowerCat.includes("beverage") || lowerCat.includes("juice") || lowerCat.includes("tea")) return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80";
    if (lowerCat.includes("dessert") || lowerCat.includes("cake")) return "https://images.unsplash.com/photo-1563729760304-8f02f35f6e65?auto=format&fit=crop&w=400&q=80";

    // Generic Default
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";
};
