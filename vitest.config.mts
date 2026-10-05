import { defineConfig } from "vitest/config"
import path from "node:path"

// Unit tests for the code that decides money and access. Every test mocks
// Prisma: the configured database is PRODUCTION, so no test may touch it.
export default defineConfig({
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
        // Belt and braces: if a test forgets to mock Prisma, it fails to
        // connect instead of reading or writing live data.
        env: {
            DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/none",
            DIRECT_URL: "postgresql://invalid:invalid@127.0.0.1:1/none",
        },
    },
})
