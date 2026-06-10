"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Start seeding...");
    // Clean existing data
    await prisma.transaction.deleteMany({});
    await prisma.package.deleteMany({});
    await prisma.game.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Deleted existing database content.");
    // Create mock user
    const mockUser = await prisma.user.create({
        data: {
            email: "gamer@example.com",
            name: "Pro Gamer",
        },
    });
    console.log(`Created mock user: ${mockUser.name} (${mockUser.id})`);
    // Create games and packages
    const gamesData = [
        {
            slug: "mobile-legends",
            name: "Mobile Legends",
            iconUrl: "/images/mlbb.png",
            inputConfig: { playerId: "string", zoneId: "string" },
            packages: [
                { name: "86 Diamonds", amount: 86, price: 1.5, originalPrice: 1.8, providerSku: "ml-86" },
                { name: "172 Diamonds", amount: 172, price: 3.0, originalPrice: 3.6, providerSku: "ml-172" },
                { name: "257 Diamonds", amount: 257, price: 4.5, originalPrice: 5.4, providerSku: "ml-257" },
                { name: "706 Diamonds", amount: 706, price: 12.0, originalPrice: 15.0, providerSku: "ml-706", bestValue: true },
                { name: "2195 Diamonds", amount: 2195, price: 35.0, originalPrice: 42.0, providerSku: "ml-2195" },
            ],
        },
        {
            slug: "pubg-mobile",
            name: "PUBG Mobile",
            iconUrl: "/images/pubg.png",
            inputConfig: { playerId: "string" },
            packages: [
                { name: "60 UC", amount: 60, price: 1.0, originalPrice: 1.2, providerSku: "pubg-60" },
                { name: "325 UC", amount: 325, price: 5.0, originalPrice: 6.0, providerSku: "pubg-325" },
                { name: "660 UC", amount: 660, price: 10.0, originalPrice: 12.0, providerSku: "pubg-660", bestValue: true },
                { name: "1800 UC", amount: 1800, price: 25.0, originalPrice: 30.0, providerSku: "pubg-1800" },
                { name: "3850 UC", amount: 3850, price: 50.0, originalPrice: 60.0, providerSku: "pubg-3850" },
            ],
        },
        {
            slug: "free-fire",
            name: "Garena Free Fire",
            iconUrl: "/images/free_fire.png",
            inputConfig: { playerId: "string" },
            packages: [
                { name: "100 Diamonds", amount: 100, price: 1.0, originalPrice: 1.2, providerSku: "ff-100" },
                { name: "310 Diamonds", amount: 310, price: 3.0, originalPrice: 3.6, providerSku: "ff-310" },
                { name: "520 Diamonds", amount: 520, price: 5.0, originalPrice: 6.0, providerSku: "ff-520", bestValue: true },
                { name: "1060 Diamonds", amount: 1060, price: 10.0, originalPrice: 12.0, providerSku: "ff-1060" },
                { name: "2180 Diamonds", amount: 2180, price: 20.0, originalPrice: 24.0, providerSku: "ff-2180" },
            ],
        },
        {
            slug: "roblox",
            name: "Roblox",
            iconUrl: "/images/roblox.png",
            inputConfig: { username: "string" },
            packages: [
                { name: "400 Robux", amount: 400, price: 5.0, originalPrice: 6.0, providerSku: "rb-400" },
                { name: "800 Robux", amount: 800, price: 10.0, originalPrice: 12.0, providerSku: "rb-800", bestValue: true },
                { name: "1700 Robux", amount: 1700, price: 20.0, originalPrice: 24.0, providerSku: "rb-1700" },
                { name: "4500 Robux", amount: 4500, price: 50.0, originalPrice: 60.0, providerSku: "rb-4500" },
            ],
        },
    ];
    for (const gameData of gamesData) {
        const game = await prisma.game.create({
            data: {
                slug: gameData.slug,
                name: gameData.name,
                iconUrl: gameData.iconUrl,
                inputConfig: gameData.inputConfig,
                packages: {
                    create: gameData.packages.map((pkg) => ({
                        name: pkg.name,
                        amount: pkg.amount,
                        price: pkg.price,
                        originalPrice: pkg.originalPrice,
                        providerSku: pkg.providerSku,
                        bestValue: pkg.bestValue || false,
                    })),
                },
            },
        });
        console.log(`Created game ${game.name} with ${gameData.packages.length} packages.`);
    }
    console.log("🌱 Seeding finished successfully!");
}
main()
    .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
