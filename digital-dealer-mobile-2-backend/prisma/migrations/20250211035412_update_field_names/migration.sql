/*
  Warnings:

  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token_expires` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
DROP COLUMN "reset_token",
DROP COLUMN "reset_token_expires",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);
