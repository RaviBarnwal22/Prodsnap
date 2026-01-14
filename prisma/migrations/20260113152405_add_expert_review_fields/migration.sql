-- AlterTable
ALTER TABLE "Review" ADD COLUMN "aiAccuracy" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PracticeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "aiScore" TEXT,
    "timeSpent" INTEGER,
    "isGoldStandard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PracticeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PracticeSubmission" ("aiScore", "answerText", "createdAt", "id", "questionId", "timeSpent", "userId") SELECT "aiScore", "answerText", "createdAt", "id", "questionId", "timeSpent", "userId" FROM "PracticeSubmission";
DROP TABLE "PracticeSubmission";
ALTER TABLE "new_PracticeSubmission" RENAME TO "PracticeSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
