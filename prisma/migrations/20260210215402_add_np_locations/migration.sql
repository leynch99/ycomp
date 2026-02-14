-- CreateTable
CREATE TABLE "NpCity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NpCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpBranch" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NpBranch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NpBranch" ADD CONSTRAINT "NpBranch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "NpCity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
