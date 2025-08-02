-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_WorkerServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkerServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkerServices_B_index" ON "_WorkerServices"("B");

-- AddForeignKey
ALTER TABLE "_WorkerServices" ADD CONSTRAINT "_WorkerServices_A_fkey" FOREIGN KEY ("A") REFERENCES "FreelanceService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkerServices" ADD CONSTRAINT "_WorkerServices_B_fkey" FOREIGN KEY ("B") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
