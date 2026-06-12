-- CreateEnum
CREATE TYPE "response_mode" AS ENUM ('SQL', 'EXPLAIN', 'PLAN');

-- CreateEnum
CREATE TYPE "entity_role" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "databaseID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "conversationID" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "mode" "response_mode",
    "generatedSQL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "entity_role" NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_databaseID_name_key" ON "conversation"("databaseID", "name");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_databaseID_fkey" FOREIGN KEY ("databaseID") REFERENCES "Database"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
