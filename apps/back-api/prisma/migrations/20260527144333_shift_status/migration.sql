-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INPROGRESS');

-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "status" "ShiftStatus" NOT NULL DEFAULT 'INPROGRESS';
