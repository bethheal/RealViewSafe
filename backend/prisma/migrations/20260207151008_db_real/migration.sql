/*
  Warnings:

  - The `category` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AgentDocumentType" AS ENUM ('BUSINESS_PROOF', 'ID_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND');

-- CreateEnum
CREATE TYPE "PropertyTransactionType" AS ENUM ('SALE', 'RENT', 'LEASE');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('HOUSE', 'APARTMENT', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "SubPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED');

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'RENTED';

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_agentId_fkey";

-- DropIndex
DROP INDEX "Subscription_expiresAt_idx";

-- DropIndex
DROP INDEX "Subscription_plan_idx";

-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "businessLocation" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BuyerProfile" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "semiFurnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionType" "PropertyTransactionType" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "type" "PropertyType" NOT NULL DEFAULT 'HOUSE',
ADD COLUMN     "unfurnished" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "category",
ADD COLUMN     "category" "PropertyCategory";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "plan",
ADD COLUMN     "plan" "SubPlan" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paystackCustomerCode" TEXT,
ADD COLUMN     "paystackSubscriptionCode" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialStartedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- CreateTable
CREATE TABLE "AgentDocument" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "AgentDocumentType" NOT NULL DEFAULT 'BUSINESS_PROOF',
    "url" TEXT NOT NULL,
    "label" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentDocument_agentId_idx" ON "AgentDocument"("agentId");

-- CreateIndex
CREATE INDEX "Property_type_idx" ON "Property"("type");

-- CreateIndex
CREATE INDEX "Property_transactionType_idx" ON "Property"("transactionType");

-- AddForeignKey
ALTER TABLE "AgentDocument" ADD CONSTRAINT "AgentDocument_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
