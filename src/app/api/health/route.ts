import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Perform a lightweight query to check database connectivity
        await prisma.$queryRaw`SELECT 1`

        return NextResponse.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected',
                environment: process.env.NODE_ENV
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 503 }
        )
    }
}
