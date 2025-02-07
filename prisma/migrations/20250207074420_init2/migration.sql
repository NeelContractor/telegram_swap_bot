/*
  Warnings:

  - You are about to drop the column `privateKey` on the `Keypair` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `Keypair` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value,userId]` on the table `Keypair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Keypair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Keypair" DROP COLUMN "privateKey",
DROP COLUMN "publicKey",
ADD COLUMN     "value" CHAR(44) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Keypair_value_userId_key" ON "Keypair"("value", "userId");
