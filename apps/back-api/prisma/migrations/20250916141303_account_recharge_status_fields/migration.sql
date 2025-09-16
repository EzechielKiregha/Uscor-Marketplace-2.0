/*
  Warnings:

  - You are about to drop the `_MediaToPostOfSale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MediaToPostOfSale" DROP CONSTRAINT "_MediaToPostOfSale_A_fkey";

-- DropForeignKey
ALTER TABLE "_MediaToPostOfSale" DROP CONSTRAINT "_MediaToPostOfSale_B_fkey";

-- DropTable
DROP TABLE "_MediaToPostOfSale";
