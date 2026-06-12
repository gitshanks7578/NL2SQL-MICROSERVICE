-- CreateEnum
CREATE TYPE "dbtype" AS ENUM ('POSTGRES', 'MYSQL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Database" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "dbtype" NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dbName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Database_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Database_userid_name_key" ON "Database"("userid", "name");

-- AddForeignKey
ALTER TABLE "Database" ADD CONSTRAINT "Database_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
