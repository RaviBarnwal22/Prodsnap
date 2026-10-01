'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, ArrowRight, Lock, Play, RotateCcw, Lightbulb, AlertTriangle,
    CheckCircle2, XCircle, Flame, Zap, HelpCircle, Trophy, BookOpen, Sparkles, X,
} from 'lucide-react'
import type { PlaygroundCategory } from '@/lib/playground/categories'
import { sectionTitle } from '@/lib/playground/categories'
import type { PlaygroundCategoryData, PlaygroundProgress, PlaygroundQuestion } from '@/lib/playground/types'
import { loadProgress, recordSection, starsFor } from '@/lib/playground/progress'
import { Confetti, Stars } from '../GameFx'

type Screen = 'map' | 'lesson' | 'quiz' | 'result'

interface Answer {
    question: PlaygroundQuestion
    picked: number
    correct: boolean
}

const HOWTO_SEEN_KEY = 'prodsnap_playground_howto_seen'
const XP_CORRECT = 10
// Questions per round. The pool per step is larger, so each round is a fresh
// random draw: rounds stay short and replays are mostly new questions.
const ROUND_LENGTH = 8

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function CategoryGame({
    category,
    data,
    sectionOrder,
}: {
    category: PlaygroundCategory
    data: PlaygroundCategoryData
    sectionOrder: string[]
}) {
    const [progress, setProgress] = useState<PlaygroundProgress>({ xp: 0, categories: {} })
    const [screen, setScreen] = useState<Screen>('map')
    const [activeKey, setActiveKey] = useState<string | null>(null)
    const [showHowTo, setShowHowTo] = useState(false)

    const [questions, setQuestions] = useState<PlaygroundQuestion[]>([])
    const [qIndex, setQIndex] = useState(0)
    const [picked, setPicked] = useState<number | null>(null)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [streak, setStreak] = useState(0)
    const [runXp, setRunXp] = useState(0)
    const [burst, setBurst] = useState(0)
    const [bigBurst, setBigBurst] = useState(false)

    useEffect(() => {
        setProgress(loadProgress())
        try {
            if (!localStorage.getItem(HOWTO_SEEN_KEY)) setShowHowTo(true)
        } catch { /* storage blocked: skip the auto-open */ }
    }, [])

    const closeHowTo = () => {
        setShowHowTo(false)
        try { localStorage.setItem(HOWTO_SEEN_KEY, '1') } catch { }
    }

    const catProgress = progress.categories[category.slug] || {}
    const isUnlocked = useCallback((i: number) => {
        if (i === 0) return true
        const prevKey = sectionOrder[i - 1]
        return (catProgress[prevKey]?.stars ?? 0) >= 1
    }, [catProgress, sectionOrder])

    const mastered = sectionOrder.every(k => (catProgress[k]?.stars ?? 0) >= 1)
    const totalStars = sectionOrder.reduce((n, k) => n + (catProgress[k]?.stars ?? 0), 0)

    const section = activeKey ? data.sections[activeKey] : null
    const current = questions[qIndex]

    const openSection = (key: string) => {
        setActiveKey(key)
        setScreen('lesson')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const startQuiz = () => {
        if (!section) return
        setQuestions(shuffle(section.questions).slice(0, ROUND_LENGTH))
        setQIndex(0)
        setPicked(null)
        setAnswers([])
        setStreak(0)
        setRunXp(0)
        setScreen('quiz')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const choose = useCallback((i: number) => {
        if (picked !== null || !current) return
        setPicked(i)
        const correct = i === current.correctIndex
        setAnswers(a => [...a, { question: current, picked: i, correct }])
        if (correct) {
            const nextStreak = streak + 1
            setStreak(nextStreak)
            // Streak bonus rewards consistency without making a single miss catastrophic.
            setRunXp(x => x + XP_CORRECT + Math.min(20, (nextStreak - 1) * 5))
            setBurst(b => b + 1)
        } else {
            setStreak(0)
        }
    }, [picked, current, streak])

    const finish = useCallback((final: Answer[]) => {
        if (!activeKey) return
        const score = final.filter(a => a.correct).length
        const updated = recordSection(category.slug, activeKey, score, final.length, runXp)
        setProgress(updated)
        setScreen('result')
        if (starsFor(score, final.length) >= 2) {
            setBigBurst(true)
            setTimeout(() => setBigBurst(false), 1800)
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
        // Measure whether the Playground is actually used, fire and forget.
        import('@/app/actions')
            .then(({ trackActivity }) => trackActivity('/playground', 'playground_section_done', `${category.slug}/${activeKey}:${score}/${final.length}`))
            .catch(() => { })
    }, [activeKey, category.slug, runXp])

    const next = useCallback(() => {
        if (picked === null) return
        if (qIndex + 1 >= questions.length) {
            finish(answers)
        } else {
            setQIndex(i => i + 1)
            setPicked(null)
        }
    }, [picked, qIndex, questions.length, answers, finish])

    // Keyboard: 1-4 picks, Enter moves on. Faster than a mouse for repeat players.
    useEffect(() => {
        if (screen !== 'quiz') return
        const onKey = (e: KeyboardEvent) => {
            if (['1', '2', '3', '4'].includes(e.key)) choose(Number(e.key) - 1)
            if (e.key === 'Enter') next()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [screen, choose, next])

    const sectionIndex = activeKey ? sectionOrder.indexOf(activeKey) : -1
    const nextKey = sectionIndex >= 0 ? sectionOrder[sectionIndex + 1] : undefined

    return (
        <div className="relative">
            <Confetti show={burst > 0 && picked !== null && picked === current?.correctIndex} intensity={0.5} key={`b${burst}`} />
            <Confetti show={bigBurst} intensity={2.2} />

            <AnimatePresence>{showHowTo && <HowToModal onClose={closeHowTo} />}</AnimatePresence>

            <AnimatePresence mode="wait">
                {/* ───────── MAP ───────── */}
                {screen === 'map' && (
                    <motion.div key="map" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                        <div className={`rounded-3xl bg-gradient-to-br ${category.gradient} p-6 md:p-8 text-white shadow-xl mb-8`}>
                            <Link href="/playground" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-4">
                                <ArrowLeft size={16} /> All categories
                            </Link>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <motion.div className="text-5xl mb-3" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, delay: 0.3 }}>{category.emoji}</motion.div>
                                    <h1 className="text-3xl md:text-4xl font-black">{category.title}</h1>
                                    <p className="text-white/90 mt-1">{category.tagline}</p>
                                    <p className="text-white/75 text-sm mt-3">Method: <span className="font-bold text-white">{data.framework}</span></p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-3xl font-black">{totalStars}<span className="text-white/60 text-lg">/{sectionOrder.length * 3}</span></p>
                                    <p className="text-xs uppercase tracking-widest text-white/70 font-bold">stars</p>
                                </div>
                            </div>
                            <button onClick={() => setShowHowTo(true)} className="mt-5 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold transition">
                                <HelpCircle size={16} /> How to play
                            </button>
                        </div>

                        {mastered && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-5 flex flex-col md:flex-row items-center gap-4">
                                <Trophy className="text-amber-500 shrink-0" size={40} />
                                <div className="flex-1 text-center md:text-left">
                                    <p className="font-black text-lg text-gray-900 dark:text-white">{category.title} mastered!</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">You know the method. Now put it together on a full real case.</p>
                                </div>
                                <Link href="/practice" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-xl font-bold">
                                    Solve a real case <ArrowRight size={16} />
                                </Link>
                            </motion.div>
                        )}

                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Your path, in interview order</h2>
                        <div className="relative">
                            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-gray-200 dark:bg-gray-800 rounded-full" aria-hidden />
                            <div className="space-y-4">
                                {sectionOrder.map((key, i) => {
                                    const s = data.sections[key]
                                    const unlocked = isUnlocked(i)
                                    const stars = catProgress[key]?.stars ?? 0
                                    const done = stars >= 1
                                    return (
                                        <motion.button
                                            key={key}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            whileHover={unlocked ? { scale: 1.01 } : undefined}
                                            whileTap={unlocked ? { scale: 0.99 } : undefined}
                                            disabled={!unlocked}
                                            onClick={() => openSection(key)}
                                            className={`relative w-full text-left flex items-center gap-4 rounded-2xl border-2 p-4 transition ${unlocked
                                                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-violet-400 shadow-sm'
                                                : 'bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className={`relative z-10 w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg ${done ? 'bg-emerald-500 text-white' : unlocked ? `bg-gradient-to-br ${category.gradient} text-white` : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                                {done ? <CheckCircle2 size={26} /> : unlocked ? i + 1 : <Lock size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-gray-900 dark:text-white">{sectionTitle(key)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{s?.subtitle}</p>
                                                {!unlocked && <p className="text-xs text-gray-400 mt-1">Get 1 star in the step above to unlock</p>}
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-1">
                                                <Stars count={stars} size="sm" />
                                                {unlocked && <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{done ? 'Replay' : 'Start'}</span>}
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ───────── LESSON ───────── */}
                {screen === 'lesson' && section && activeKey && (
                    <motion.div key="lesson" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="max-w-2xl mx-auto">
                        <button onClick={() => setScreen('map')} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-semibold mb-5">
                            <ArrowLeft size={16} /> Back to path
                        </button>

                        <p className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
                            Step {sectionIndex + 1} of {sectionOrder.length} · 60 second lesson
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">{sectionTitle(activeKey)}</h1>

                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6">
                            {section.lesson.hook}
                        </motion.p>

                        <div className="space-y-4">
                            <LessonCard delay={0.2} icon={<BookOpen size={18} />} title="What it is" tone="violet">
                                <p>{section.lesson.what}</p>
                            </LessonCard>

                            <LessonCard delay={0.3} icon={<Zap size={18} />} title="How to do it" tone="blue">
                                <ol className="space-y-2">
                                    {section.lesson.how.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </LessonCard>

                            <LessonCard delay={0.4} icon={<Lightbulb size={18} />} title="Looks like this" tone="emerald">
                                <p className="italic">{section.lesson.example}</p>
                            </LessonCard>

                            <LessonCard delay={0.5} icon={<AlertTriangle size={18} />} title="Most common mistake" tone="rose">
                                <p>{section.lesson.mistake}</p>
                            </LessonCard>
                        </div>


                        <motion.button
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={startQuiz}
                            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${category.gradient} text-white py-4 font-black text-lg shadow-lg`}
                        >
                            <Play size={20} /> Start {Math.min(ROUND_LENGTH, section.questions.length)} questions
                        </motion.button>
                        <p className="text-center text-xs text-gray-500 mt-3">No typing. Just pick the best answer. Get {Math.ceil(Math.min(ROUND_LENGTH, section.questions.length) * 0.6)} right to unlock the next step. {section.questions.length > ROUND_LENGTH ? `Each round picks ${ROUND_LENGTH} of ${section.questions.length} questions at random.` : ''}</p>
                    </motion.div>
                )}

                {/* ───────── QUIZ ───────── */}
                {screen === 'quiz' && current && activeKey && (
                    <motion.div key={`quiz-${qIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-5">
                            <button onClick={() => setScreen('map')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" aria-label="Quit to path"><X size={20} /></button>
                            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div className={`h-full bg-gradient-to-r ${category.gradient}`} initial={false} animate={{ width: `${((qIndex + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120 }} />
                            </div>
                            <AnimatePresence>
                                {streak >= 2 && (
                                    <motion.span key={streak} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1 text-orange-500 font-black text-sm">
                                        <Flame size={16} /> {streak}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <span className="inline-flex items-center gap-1 text-amber-500 font-black text-sm tabular-nums"><Zap size={16} />{runXp}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Q{qIndex + 1}/{questions.length}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${current.source === 'bonus' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'}`}>
                                {current.source === 'bonus' ? '✨ Bonus case' : '📁 From our cases'}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{current.caseTitle}</p>
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 mb-4">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{current.scenario}</p>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-5">{current.question}</h2>

                        <div className="space-y-3">
                            {current.options.map((opt, i) => {
                                const isCorrect = i === current.correctIndex
                                const isPicked = i === picked
                                const revealed = picked !== null
                                let cls = 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
                                if (revealed && isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                else if (revealed && isPicked) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                else if (revealed) cls = 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-50'
                                return (
                                    <motion.button
                                        key={i}
                                        disabled={revealed}
                                        onClick={() => choose(i)}
                                        whileHover={!revealed ? { x: 4 } : undefined}
                                        animate={revealed && isPicked && !isCorrect ? { x: [0, -10, 10, -6, 6, 0] } : revealed && isCorrect ? { scale: [1, 1.03, 1] } : {}}
                                        transition={{ duration: 0.4 }}
                                        className={`w-full text-left flex items-start gap-3 rounded-2xl border-2 p-4 transition ${cls}`}
                                    >
                                        <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${revealed && isCorrect ? 'bg-emerald-500 text-white' : revealed && isPicked ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            {revealed && isCorrect ? <CheckCircle2 size={16} /> : revealed && isPicked ? <XCircle size={16} /> : i + 1}
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">{opt}</span>
                                    </motion.button>
                                )
                            })}
                        </div>

                        <AnimatePresence>
                            {picked !== null && section && (
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                                    <div className={`rounded-2xl p-5 ${picked === current.correctIndex ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'}`}>
                                        <p className={`font-black mb-2 ${picked === current.correctIndex ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                            {picked === current.correctIndex ? (streak >= 3 ? `On fire! ${streak} in a row 🔥` : 'Nailed it!') : 'Not quite, and that one is tricky.'}
                                        </p>
                                        {picked !== current.correctIndex && current.whyWrong[picked] && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3"><span className="font-bold">Why your pick is tempting but wrong:</span> {current.whyWrong[picked]}</p>
                                        )}
                                        <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-bold">Why the answer is right:</span> {current.explanation}</p>
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 font-black text-lg">
                                        {qIndex + 1 >= questions.length ? 'See my score' : 'Next question'} <ArrowRight size={20} />
                                    </motion.button>
                                    <p className="hidden md:block text-center text-xs text-gray-400">Tip: press 1 to 4 to answer, Enter to continue</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ───────── RESULT ───────── */}
                {screen === 'result' && activeKey && (
                    <ResultScreen
                        key="result"
                        answers={answers}
                        runXp={runXp}
                        title={sectionTitle(activeKey)}
                        gradient={category.gradient}
                        hasNext={!!nextKey}
                        nextTitle={nextKey ? sectionTitle(nextKey) : ''}
                        onRetry={startQuiz}
                        onNext={() => nextKey && openSection(nextKey)}
                        onMap={() => setScreen('map')}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function LessonCard({ icon, title, tone, delay, children }: { icon: React.ReactNode; title: string; tone: 'violet' | 'blue' | 'emerald' | 'rose'; delay: number; children: React.ReactNode }) {
    const tones = {
        violet: 'border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-300',
        blue: 'border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300',
        emerald: 'border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300',
        rose: 'border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300',
    }
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`rounded-2xl border-2 bg-white dark:bg-gray-900 p-5 ${tones[tone]}`}>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2">{icon}{title}</p>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
        </motion.div>
    )
}

function ResultScreen({
    answers, runXp, title, gradient, hasNext, nextTitle, onRetry, onNext, onMap,
}: {
    answers: Answer[]; runXp: number; title: string; gradient: string; hasNext: boolean; nextTitle: string
    onRetry: () => void; onNext: () => void; onMap: () => void
}) {
    const score = answers.filter(a => a.correct).length
    const stars = starsFor(score, answers.length)
    const passed = stars >= 1
    const mistakes = answers.filter(a => !a.correct)
    const headline = stars === 3 ? 'Perfect run! 🏆' : stars === 2 ? 'Great work! 🎉' : stars === 1 ? 'Unlocked! 🔓' : 'So close. Try again? 💪'

    return (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <div className={`rounded-3xl bg-gradient-to-br ${gradient} text-white p-8 shadow-xl`}>
                <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-2">{title}</p>
                <h1 className="text-3xl md:text-4xl font-black mb-4">{headline}</h1>
                <Stars count={stars} size="lg" />
                <div className="mt-6 flex justify-center gap-8">
                    <div>
                        <p className="text-4xl font-black tabular-nums">{score}<span className="text-white/60 text-2xl">/{answers.length}</span></p>
                        <p className="text-xs uppercase tracking-widest text-white/70 font-bold">correct</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black tabular-nums">+{runXp}</p>
                        <p className="text-xs uppercase tracking-widest text-white/70 font-bold">xp</p>
                    </div>
                </div>
                {!passed && <p className="mt-5 text-sm text-white/90">Get {Math.ceil(answers.length * 0.6)} right to unlock the next step. The questions shuffle each time.</p>}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {passed && hasNext ? (
                    <button onClick={onNext} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${gradient} text-white py-4 font-black`}>
                        Next: {nextTitle} <ArrowRight size={18} />
                    </button>
                ) : null}
                <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-4 font-bold">
                    <RotateCcw size={18} /> {passed ? 'Replay for 3 stars' : 'Try again'}
                </button>
                <button onClick={onMap} className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-4 font-bold">
                    Back to path
                </button>
            </div>

            {mistakes.length > 0 && (
                <div className="mt-8 text-left">
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 mb-3"><Sparkles size={16} /> Learn from the ones you missed</h2>
                    <div className="space-y-3">
                        {mistakes.map((m, i) => (
                            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                                <p className="text-xs font-bold text-gray-400 mb-1">{m.question.caseTitle}</p>
                                <p className="font-bold text-gray-900 dark:text-white mb-2">{m.question.question}</p>
                                <p className="text-sm text-rose-600 dark:text-rose-400 mb-1"><XCircle size={14} className="inline mr-1" />You picked: {m.question.options[m.picked]}</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2"><CheckCircle2 size={14} className="inline mr-1" />Best answer: {m.question.options[m.question.correctIndex]}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{m.question.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

function HowToModal({ onClose }: { onClose: () => void }) {
    const steps = [
        { emoji: '🗺️', title: 'Pick a step', text: 'Every case type is broken into 6 steps, in the same order you would use them in a real interview.' },
        { emoji: '📖', title: 'Read a 60 second lesson', text: 'What the step is, how to do it, a real example, and the mistake most people make.' },
        { emoji: '👆', title: 'Answer 8 quick questions', text: 'Real situations from our cases plus a few bonus ones. Just click. No typing, ever.' },
        { emoji: '⭐', title: 'Earn stars', text: '5 right gets 1 star and unlocks the next step. 6 right gets 2 stars. All 8 right gets 3.' },
        { emoji: '🏆', title: 'Master the method', text: 'Finish all 6 steps, then try a full real case. You will know exactly what to do.' },
    ]
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 p-6 md:p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <motion.div className="text-5xl mb-2" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🎮</motion.div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">How to play</h2>
                    <p className="text-sm text-gray-500 mt-1">Learn how to crack PM cases, one step at a time</p>
                </div>
                <div className="space-y-3">
                    {steps.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="flex gap-3 items-start rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                            <span className="text-2xl shrink-0">{s.emoji}</span>
                            <div>
                                <p className="font-black text-gray-900 dark:text-white text-sm">{i + 1}. {s.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-black">Heads up:</span> the wrong answers are tricky on purpose. They are the mistakes real candidates make. When you miss one, read why. That is where the learning happens.
                </div>
                <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 font-black text-lg">
                    Let&apos;s go 🚀
                </button>
            </motion.div>
        </motion.div>
    )
}
