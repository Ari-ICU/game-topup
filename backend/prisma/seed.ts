import { PrismaClient, Provider, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // Clean existing data
  await prisma.transaction.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Deleted existing database content.");

  // Create hashed passwords
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@123", 10);

  // Create mock Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@topuppay.com",
      name: "System Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${adminUser.name} (${adminUser.id})`);

  // Create mock Staff
  const staffUser = await prisma.user.create({
    data: {
      email: "staff@topuppay.com",
      name: "Support Staff",
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
    },
  });
  console.log(`Created staff user: ${staffUser.name} (${staffUser.id})`);

  // Create mock user (regular user for transactions)
  const mockUser = await prisma.user.create({
    data: {
      email: "gamer@example.com",
      name: "Pro Gamer",
      role: Role.USER,
    },
  });
  console.log(`Created mock user: ${mockUser.name} (${mockUser.id})`);

  // Create games and packages
  const gamesData = [
    {
      slug: "mobile-legends",
      name: "Mobile Legends",
      iconUrl: "/images/mlbb.avif",
      inputConfig: { playerId: "string", zoneId: "string" },
      isHot: true,
      packages: [
        { name: "86 Diamonds", amount: 86, price: 1.5, originalPrice: 1.8, providerSku: "smileone-MLBB-86", provider: Provider.SMILE_ONE },
        { name: "172 Diamonds", amount: 172, price: 3.0, originalPrice: 3.6, providerSku: "smileone-MLBB-172", provider: Provider.SMILE_ONE },
        { name: "257 Diamonds", amount: 257, price: 4.5, originalPrice: 5.4, providerSku: "smileone-MLBB-257", provider: Provider.SMILE_ONE },
        { name: "706 Diamonds", amount: 706, price: 12.0, originalPrice: 15.0, providerSku: "smileone-MLBB-706", bestValue: true, provider: Provider.SMILE_ONE },
        { name: "2195 Diamonds", amount: 2195, price: 35.0, originalPrice: 42.0, providerSku: "smileone-MLBB-2195", provider: Provider.SMILE_ONE },
      ],
    },
    {
      slug: "pubg-mobile",
      name: "PUBG Mobile",
      iconUrl: "/images/pubg.avif",
      inputConfig: { playerId: "string" },
      isHot: false,
      packages: [
        { name: "60 UC", amount: 60, price: 1.0, originalPrice: 1.2, providerSku: "unipin-PUBG-60", provider: Provider.UNIPIN },
        { name: "325 UC", amount: 325, price: 5.0, originalPrice: 6.0, providerSku: "unipin-PUBG-325", provider: Provider.UNIPIN },
        { name: "660 UC", amount: 660, price: 10.0, originalPrice: 12.0, providerSku: "unipin-PUBG-660", bestValue: true, provider: Provider.UNIPIN },
        { name: "1800 UC", amount: 1800, price: 25.0, originalPrice: 30.0, providerSku: "unipin-PUBG-1800", provider: Provider.UNIPIN },
        { name: "3850 UC", amount: 3850, price: 50.0, originalPrice: 60.0, providerSku: "unipin-PUBG-3850", provider: Provider.UNIPIN },
      ],
    },
    {
      slug: "free-fire",
      name: "Garena Free Fire",
      iconUrl: "/images/free_fire.png",
      inputConfig: { playerId: "string" },
      isHot: false,
      packages: [
        { name: "100 Diamonds", amount: 100, price: 1.0, originalPrice: 1.2, providerSku: "smileone-FF-100", provider: Provider.SMILE_ONE },
        { name: "310 Diamonds", amount: 310, price: 3.0, originalPrice: 3.6, providerSku: "smileone-FF-310", provider: Provider.SMILE_ONE },
        { name: "520 Diamonds", amount: 520, price: 5.0, originalPrice: 6.0, providerSku: "smileone-FF-520", bestValue: true, provider: Provider.SMILE_ONE },
        { name: "1060 Diamonds", amount: 1060, price: 10.0, originalPrice: 12.0, providerSku: "smileone-FF-1060", provider: Provider.SMILE_ONE },
        { name: "2180 Diamonds", amount: 2180, price: 20.0, originalPrice: 24.0, providerSku: "smileone-FF-2180", provider: Provider.SMILE_ONE },
      ],
    },
    {
      slug: "roblox",
      name: "Roblox",
      iconUrl: "/images/roblox.jpg",
      inputConfig: { username: "string" },
      isHot: false,
      packages: [
        { name: "400 Robux", amount: 400, price: 5.0, originalPrice: 6.0, providerSku: "topuplive-ROBLOX-400", provider: Provider.TOPUPLIVE },
        { name: "800 Robux", amount: 800, price: 10.0, originalPrice: 12.0, providerSku: "topuplive-ROBLOX-800", bestValue: true, provider: Provider.TOPUPLIVE },
        { name: "1700 Robux", amount: 1700, price: 20.0, originalPrice: 24.0, providerSku: "topuplive-ROBLOX-1700", provider: Provider.TOPUPLIVE },
        { name: "4500 Robux", amount: 4500, price: 50.0, originalPrice: 60.0, providerSku: "topuplive-ROBLOX-4500", provider: Provider.TOPUPLIVE },
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
        isHot: gameData.isHot,
        packages: {
          create: gameData.packages.map((pkg) => ({
            name: pkg.name,
            amount: pkg.amount,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            providerSku: pkg.providerSku,
            provider: pkg.provider,
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
