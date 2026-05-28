-- CreateTable
CREATE TABLE "_StoreToWorker" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StoreToWorker_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StoreToWorker_B_index" ON "_StoreToWorker"("B");

-- AddForeignKey
ALTER TABLE "_StoreToWorker" ADD CONSTRAINT "_StoreToWorker_A_fkey" FOREIGN KEY ("A") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreToWorker" ADD CONSTRAINT "_StoreToWorker_B_fkey" FOREIGN KEY ("B") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
