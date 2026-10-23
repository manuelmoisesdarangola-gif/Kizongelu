-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'EXHAUSTED', 'EXPIRED', 'CANCELLED');

-- AlterTable Plan
ALTER TABLE "Plan" 
    ADD COLUMN "displayName" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "maxUsers" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "badge" TEXT,
    ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DROP COLUMN "monthlyLimit";

ALTER TABLE "Plan" ALTER COLUMN "price" TYPE DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "Plan_active_order_idx" ON "Plan"("active", "order");

-- CreateTable Package
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "totalCredits" INTEGER NOT NULL,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "remainingCredits" INTEGER NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exhaustedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "purchaseAmount" DECIMAL(12,2) NOT NULL,
    "paymentId" TEXT,
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Package_userId_status_idx" ON "Package"("userId", "status");

-- CreateIndex
CREATE INDEX "Package_status_remainingCredits_idx" ON "Package"("status", "remainingCredits");

-- CreateIndex
CREATE INDEX "Package_planId_idx" ON "Package"("planId");

-- CreateIndex
CREATE INDEX "Package_purchasedAt_idx" ON "Package"("purchasedAt");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
