
import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";
dotenv.config();

async function check() {
    const lastArticle = await (prisma as any).article.findFirst({
        where: { articleType: 'DAILY' },
        orderBy: { updatedAt: 'desc' }
    });
    console.log("Last Article:", lastArticle?.title, lastArticle?.updatedAt);
}
check().finally(() => prisma.$disconnect());
