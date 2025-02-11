/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_image_url" TEXT,
ADD COLUMN     "role_id" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Dealership" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "primary_contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealershipBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dealership_id" INTEGER NOT NULL,
    "primary_contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealershipBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealershipDepartment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dealership_brand_id" INTEGER NOT NULL,
    "primary_contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dealershipId" INTEGER,

    CONSTRAINT "DealershipDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityType" (
    "id" SERIAL NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDealershipAccess" (
    "user_id" INTEGER NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDealershipAccess_pkey" PRIMARY KEY ("user_id","entity_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "slug" TEXT,
    "profile_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrCode" (
    "id" SERIAL NOT NULL,
    "qr_code" TEXT NOT NULL,
    "dealership_id" INTEGER NOT NULL,
    "dealership_brand_id" INTEGER NOT NULL,
    "dealership_department_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL NOT NULL,
    "qrcode_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLog" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "currentuser_id" INTEGER NOT NULL,
    "prioruser_ids" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "comment_text" TEXT NOT NULL,
    "customerlog_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "user_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "dealership_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DealershipBrand" ADD CONSTRAINT "DealershipBrand_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealershipDepartment" ADD CONSTRAINT "DealershipDepartment_dealership_brand_id_fkey" FOREIGN KEY ("dealership_brand_id") REFERENCES "DealershipBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealershipDepartment" ADD CONSTRAINT "DealershipDepartment_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDealershipAccess" ADD CONSTRAINT "UserDealershipAccess_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDealershipAccess" ADD CONSTRAINT "UserDealershipAccess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_dealership_brand_id_fkey" FOREIGN KEY ("dealership_brand_id") REFERENCES "DealershipBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_dealership_department_id_fkey" FOREIGN KEY ("dealership_department_id") REFERENCES "DealershipDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_qrcode_id_fkey" FOREIGN KEY ("qrcode_id") REFERENCES "QrCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerLog" ADD CONSTRAINT "CustomerLog_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_customerlog_id_fkey" FOREIGN KEY ("customerlog_id") REFERENCES "CustomerLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "Dealership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
