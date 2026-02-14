
import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";
dotenv.config();

async function check() {
    const logs = await (prisma as any).apiUsageLog.findMany({
        where: { provider: 'perplexity' },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    logs.forEach(l => {
        console.log(`${l.createdAt} | ${l.status} | ${l.errorMessage?.substring(0, 50)}`);
    });
}
check().finally(() => prisma.$disconnect());
