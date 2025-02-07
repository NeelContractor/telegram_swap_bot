/*
  Warnings:

  - You are about to drop the `Keypair` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Keypair" DROP CONSTRAINT "Keypair_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "keypair" TEXT;

-- DropTable
DROP TABLE "Keypair";
