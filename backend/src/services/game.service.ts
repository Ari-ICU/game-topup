import { prisma } from "../lib/prisma";

/**
 * Fetch all active games with package counts
 */
export const getAllActiveGames = async () => {
  return await prisma.game.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { packages: true },
      },
    },
  });
};

/**
 * Fetch game details and denomination packages by slug
 */
export const getGameBySlugDetails = async (slug: string) => {
  const game = await prisma.game.findFirst({
    where: { slug, isActive: true },
    include: {
      packages: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  return game;
};
