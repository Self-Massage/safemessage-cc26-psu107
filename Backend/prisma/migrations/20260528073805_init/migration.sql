-- AlterTable
ALTER TABLE "History" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "normalScore" DOUBLE PRECISION,
ADD COLUMN     "phishingScore" DOUBLE PRECISION,
ADD COLUMN     "rekomendasi" TEXT;
