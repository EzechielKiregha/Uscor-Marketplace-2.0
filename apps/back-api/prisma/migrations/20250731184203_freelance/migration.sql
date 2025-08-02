-- CreateEnum
CREATE TYPE "FreelanceServiceCategory" AS ENUM ('PLUMBER', 'ELECTRICIAN', 'CARPENTER', 'MECHANIC', 'TUTOR', 'CLEANER', 'OTHER');

-- AlterTable
ALTER TABLE "FreelanceService" ADD COLUMN     "category" "FreelanceServiceCategory" DEFAULT 'OTHER';
