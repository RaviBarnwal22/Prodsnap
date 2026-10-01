'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

/**
 * Confetti without a new dependency: a burst of framer-motion particles.
 * `intensity` scales the particle count, so a correct answer gets a small pop
 * and finishing a section gets the full celebration.
 */
export function Confetti({ show, intensity = 1 }: { show: boolean; intensity?: number }) {
    const pieces = useMemo(() => {
        const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
        return Array.from({ length: Math.round(28 * intensity) }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 700,
            y: -(Math.random() * 380 + 160),
            rotate: Math.random() * 720 - 360,
            size: Math.random() * 8 + 6,
            color: colors[i % colors.length],
            round: Math.random() > 0.5,
            delay: Math.random() * 0.15,
        }))
        // Recompute on every burst so it never looks like a loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, intensity])

    return (
        <AnimatePresence>
            {show && (
                <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
                    {pieces.map(p => (
                        <motion.span
                            key={p.id}
                            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
                            animate={{ x: p.x, y: [0, p.y, p.y + 600], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.6, ease: 'easeOut', delay: p.delay }}
                            style={{
                                width: p.size,
                                height: p.round ? p.size : p.size * 0.45,
                                backgroundColor: p.color,
                                borderRadius: p.round ? '999px' : '2px',
                                position: 'absolute',
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    )
}

export function Stars({ count, size = 'md' }: { count: number; size?: 'sm' | 'md' | 'lg' }) {
    const cls = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-sm' : 'text-xl'
    return (
        <span className={`inline-flex gap-0.5 ${cls}`} aria-label={`${count} of 3 stars`}>
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    initial={size === 'lg' ? { scale: 0, rotate: -90 } : false}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.25 + i * 0.25, type: 'spring', stiffness: 300 }}
                    className={i < count ? '' : 'grayscale opacity-30'}
                >
                    ⭐
                </motion.span>
            ))}
        </span>
    )
}
