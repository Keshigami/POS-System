"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var admin, categories, createdCategories, _i, categories_1, cat, category, beveragesCategory, foodCategory, snacksCategory, essentialsCategory, coffee, pandesal, rice, noodles, soda, chips, candy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.upsert({
                        where: { pin: "1234" },
                        update: {},
                        create: {
                            name: "Admin User",
                            pin: "1234",
                            role: "ADMIN",
                        },
                    })];
                case 1:
                    admin = _a.sent();
                    console.log({ admin: admin });
                    categories = ["Beverages", "Food", "Snacks", "Essentials"];
                    createdCategories = [];
                    _i = 0, categories_1 = categories;
                    _a.label = 2;
                case 2:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 5];
                    cat = categories_1[_i];
                    return [4 /*yield*/, prisma.category.create({
                            data: { name: cat },
                        })];
                case 3:
                    category = _a.sent();
                    createdCategories.push(category);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    beveragesCategory = createdCategories.find(function (c) { return c.name === "Beverages"; });
                    foodCategory = createdCategories.find(function (c) { return c.name === "Food"; });
                    snacksCategory = createdCategories.find(function (c) { return c.name === "Snacks"; });
                    essentialsCategory = createdCategories.find(function (c) { return c.name === "Essentials"; });
                    return [4 /*yield*/, prisma.product.createMany({
                            data: [
                                // Beverages
                                { name: "Coffee", price: 120, stock: 100, categoryId: beveragesCategory.id },
                                { name: "Tea", price: 100, stock: 100, categoryId: beveragesCategory.id },
                                { name: "Soda", price: 50, stock: 150, categoryId: beveragesCategory.id },
                                { name: "Bottled Water", price: 20, stock: 200, categoryId: beveragesCategory.id },
                                // Food
                                { name: "Pandesal", price: 30, stock: 100, categoryId: foodCategory.id },
                                { name: "Rice (1kg)", price: 55, stock: 80, categoryId: foodCategory.id },
                                { name: "Eggs (per piece)", price: 8, stock: 200, categoryId: foodCategory.id },
                                { name: "Instant Noodles", price: 15, stock: 150, categoryId: foodCategory.id },
                                // Snacks
                                { name: "Chips", price: 25, stock: 100, categoryId: snacksCategory.id },
                                { name: "Candy", price: 5, stock: 300, categoryId: snacksCategory.id },
                                // Essentials
                                { name: "Sugar (1kg)", price: 60, stock: 50, categoryId: essentialsCategory.id },
                                { name: "Salt", price: 15, stock: 80, categoryId: essentialsCategory.id },
                                { name: "Milk (1L)", price: 90, stock: 60, categoryId: essentialsCategory.id },
                            ],
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Coffee" } })];
                case 7:
                    coffee = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Pandesal" } })];
                case 8:
                    pandesal = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Rice (1kg)" } })];
                case 9:
                    rice = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Instant Noodles" } })];
                case 10:
                    noodles = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Soda" } })];
                case 11:
                    soda = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Chips" } })];
                case 12:
                    chips = _a.sent();
                    return [4 /*yield*/, prisma.product.findFirst({ where: { name: "Candy" } })];
                case 13:
                    candy = _a.sent();
                    if (!(coffee && pandesal)) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.package.create({
                            data: {
                                name: "Breakfast Combo",
                                description: "Perfect morning starter",
                                price: 140,
                                items: {
                                    create: [
                                        { productId: coffee.id, quantity: 1 },
                                        { productId: pandesal.id, quantity: 1 },
                                    ],
                                },
                            },
                        })];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15:
                    if (!(rice && noodles && soda)) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.package.create({
                            data: {
                                name: "Lunch Special",
                                description: "Quick and filling meal",
                                price: 100,
                                items: {
                                    create: [
                                        { productId: rice.id, quantity: 1 },
                                        { productId: noodles.id, quantity: 1 },
                                        { productId: soda.id, quantity: 1 },
                                    ],
                                },
                            },
                        })];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17:
                    if (!(chips && candy && soda)) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.package.create({
                            data: {
                                name: "Snack Pack",
                                description: "Sweet treats combo",
                                price: 70,
                                items: {
                                    create: [
                                        { productId: chips.id, quantity: 1 },
                                        { productId: candy.id, quantity: 2 },
                                        { productId: soda.id, quantity: 1 },
                                    ],
                                },
                            },
                        })];
                case 18:
                    _a.sent();
                    _a.label = 19;
                case 19: return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error(e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
