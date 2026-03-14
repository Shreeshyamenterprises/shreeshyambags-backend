-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "quantityKg" INTEGER NOT NULL,
    "gsm" INTEGER,
    "printing" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "message" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "adminPricePerKg" INTEGER,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
