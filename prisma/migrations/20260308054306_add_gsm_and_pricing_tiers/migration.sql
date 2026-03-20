-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropIndex
DROP INDEX "Variant_productId_idx";

-- DropIndex
DROP INDEX "Variant_sku_key";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "gsm" INTEGER,
ADD COLUMN     "pricePerKg" INTEGER;

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "minQtyKg" INTEGER NOT NULL,
    "pricePerKg" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
