ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';

ALTER TABLE "Order"
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
