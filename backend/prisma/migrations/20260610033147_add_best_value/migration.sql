-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "originalPrice" DECIMAL NOT NULL,
    "providerSku" TEXT NOT NULL,
    "bestValue" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Package_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("amount", "gameId", "id", "name", "originalPrice", "price", "providerSku") SELECT "amount", "gameId", "id", "name", "originalPrice", "price", "providerSku" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
