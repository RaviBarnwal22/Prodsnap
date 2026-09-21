import { ImageResponse } from 'next/og'

// Prerendered at build time and served as a static asset, so the URL
// `https://prodsnap.in/og-image.png` stays valid for metadata, Twitter cards
// and the Article/Organization JSON-LD blocks that hardcode it.
export const dynamic = 'force-static'

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1e3a8a 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        fontSize: 34,
                        fontWeight: 700,
                        color: '#a5b4fc',
                        letterSpacing: '-0.02em',
                        marginBottom: 28,
                    }}
                >
                    Prodsnap
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 76,
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        marginBottom: 28,
                    }}
                >
                    Master Product Management Interviews
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 32,
                        color: '#c7d2fe',
                        lineHeight: 1.4,
                    }}
                >
                    Instant AI feedback on real PM cases — product sense, metrics,
                    RCA and strategy.
                </div>
                <div
                    style={{
                        display: 'flex',
                        marginTop: 48,
                        fontSize: 26,
                        color: '#818cf8',
                        fontWeight: 600,
                    }}
                >
                    prodsnap.in
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    )
}
