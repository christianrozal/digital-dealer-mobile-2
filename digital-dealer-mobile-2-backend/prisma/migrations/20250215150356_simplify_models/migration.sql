/*
  Warnings:

  - You are about to drop the column `dealership_id` on the `DealershipScan` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `dealership_id` on the `QrCode` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `QrCode` table. All the data in the column will be lost.
  - The primary key for the `UserDealershipAccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `entity_id` on the `UserDealershipAccess` table. All the data in the column will be lost.
  - You are about to drop the `EntityType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,dealership_id,dealership_brand_id,dealership_department_id]` on the table `UserDealershipAccess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `dealership_brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `dealership_departments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DealershipScan" DROP CONSTRAINT "DealershipScan_dealership_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_dealership_department_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_dealership_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDealershipAccess" DROP CONSTRAINT "UserDealershipAccess_entity_id_fkey";

-- AlterTable
ALTER TABLE "DealershipScan" DROP COLUMN "dealership_id",
ADD COLUMN     "dealershipId" INTEGER,
ADD COLUMN     "form_data" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "entity_id",
ADD COLUMN     "dealership_brand_id" INTEGER,
ADD COLUMN     "dealership_department_id" INTEGER,
ADD COLUMN     "dealership_id" INTEGER;

-- AlterTable
ALTER TABLE "QrCode" DROP COLUMN "dealership_id",
DROP COLUMN "qr_code",
ADD COLUMN     "dealershipId" INTEGER,
ALTER COLUMN "dealership_department_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserDealershipAccess" DROP CONSTRAINT "UserDealershipAccess_pkey",
DROP COLUMN "entity_id",
ADD COLUMN     "dealership_brand_id" INTEGER,
ADD COLUMN     "dealership_department_id" INTEGER,
ADD COLUMN     "dealership_id" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserDealershipAccess_pkey" PRIMARY KEY ("id");

-- Drop EntityType table
DROP TABLE IF EXISTS "EntityType";

-- CreateIndex
CREATE UNIQUE INDEX "UserDealershipAccess_user_id_dealership_id_dealership_brand_key" ON "UserDealershipAccess"("user_id", "dealership_id", "dealership_brand_id", "dealership_department_id");

-- CreateIndex
CREATE UNIQUE INDEX "dealership_brands_slug_key" ON "dealership_brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "dealership_departments_slug_key" ON "dealership_departments"("slug");

-- AddForeignKey
ALTER TABLE "UserDealershipAccess" ADD CONSTRAINT "UserDealershipAccess_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDealershipAccess" ADD CONSTRAINT "UserDealershipAccess_dealership_brand_id_fkey" FOREIGN KEY ("dealership_brand_id") REFERENCES "dealership_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDealershipAccess" ADD CONSTRAINT "UserDealershipAccess_dealership_department_id_fkey" FOREIGN KEY ("dealership_department_id") REFERENCES "dealership_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_dealership_department_id_fkey" FOREIGN KEY ("dealership_department_id") REFERENCES "dealership_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "dealerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealershipScan" ADD CONSTRAINT "DealershipScan_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "dealerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_dealership_brand_id_fkey" FOREIGN KEY ("dealership_brand_id") REFERENCES "dealership_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_dealership_department_id_fkey" FOREIGN KEY ("dealership_department_id") REFERENCES "dealership_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
