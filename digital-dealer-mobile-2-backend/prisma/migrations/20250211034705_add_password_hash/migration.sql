/*
  Warnings:

  - You are about to drop the column `dealershipId` on the `DealershipDepartment` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_dealership_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_customerlog_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomerLog" DROP CONSTRAINT "CustomerLog_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "DealershipBrand" DROP CONSTRAINT "DealershipBrand_dealership_id_fkey";

-- DropForeignKey
ALTER TABLE "DealershipDepartment" DROP CONSTRAINT "DealershipDepartment_dealershipId_fkey";

-- DropForeignKey
ALTER TABLE "DealershipDepartment" DROP CONSTRAINT "DealershipDepartment_dealership_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_dealership_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_dealership_department_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_dealership_id_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_qrcode_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDealershipAccess" DROP CONSTRAINT "UserDealershipAccess_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDealershipAccess" DROP CONSTRAINT "UserDealershipAccess_user_id_fkey";

-- AlterTable
ALTER TABLE "DealershipDepartment" DROP COLUMN "dealershipId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires" TIMESTAMP(3);
