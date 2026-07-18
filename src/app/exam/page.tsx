'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Camera, Shield, Monitor, Clock, AlertTriangle,
  CheckCircle2, XCircle, Eye, EyeOff, ChevronRight,
  Lock, Maximize, Wifi, Cpu, MessageSquare, Send
} from 'lucide-react'

const EXAM_QUESTIONS = [
  {
    id: 1,
    category: 'Product Sense',
    timeLimit: 20,
    question:
      "You are the PM for Swiggy Instamart. Grocery delivery adoption in Tier-2 cities is 60% lower than metros. Walk me through how you would approach this problem, define success metrics, and propose your top 3 solutions.",
    hints: ['Clarify the problem', 'Segment users', 'Prioritise with rationale'],
  },
  {
    id: 2,
    category: 'Metrics & Execution',
    timeLimit: 15,
    question:
      "CRED's 7-day retention has dropped from 42% to 28% in the last quarter after a new onboarding redesign. How do you diagnose the root cause and what would you do next?",
    hints: ['Funnel analysis', 'Cohort comparison', 'Hypothesis-driven approach'],
  },
  {
    id: 3,
    category: 'Strategy',
    timeLimit: 15,
    question:
      "PhonePe wants to enter the B2B payments space (paying vendors, managing payroll for SMEs). Should they build, buy, or partner? Justify with a framework.",
    hints: ['Market sizing', 'Build vs. Buy analysis', 'Risk & trade-offs'],
  },
]

type ExamPhase = 'intro' | 'systemcheck' | 'live' | 'submitted'
interface Violation { type: string; time: string; count: number }
interface IvrQuestion { id: string; text: string; timestamp: string }
interface IvrResponse { questionId: string; text: string }

// ── LocalStorage keys ─────────────────────────────────────────────────────────
const LS = {
  currentQ:   'ps_exam_current_q',
  timeLeft:   'ps_exam_time_left',
  answer:     (q: number) => `ps_exam_answer_${q}`,
  violations: 'ps_exam_violations',
  status:     'ps_exam_status',
  ivrQs:      'ps_ivr_questions',
  ivrResps:   'ps_ivr_responses',
}

export default function ExamPage() {
  const [phase, setPhase]               = useState<ExamPhase>('intro')
  const [checks, setChecks]             = useState({ camera: false, fullscreen: false, network: false })
  const [camError, setCamError]         = useState('')
  const [currentQ, setCurrentQ]         = useState(0)
  const [answers, setAnswers]           = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft]         = useState(0)
  const [violations, setViolations]     = useState<Violation[]>([])
  const [violationFlash, setViolationFlash] = useState(false)
  const [showWarning, setShowWarning]   = useState<string | null>(null)
  const [wordCount, setWordCount]       = useState(0)
  const [examStartTime]                 = useState<Date>(new Date())

  // Interviewer communication
  const [ivrQuestions, setIvrQuestions]   = useState<IvrQuestion[]>([])
  const [ivrResponses, setIvrResponses]   = useState<IvrResponse[]>({} as any)
  const [replyValues, setReplyValues]     = useState<Record<string, string>>({})
  const [newIvrBadge, setNewIvrBadge]     = useState(0)
  const [showIvrPanel, setShowIvrPanel]   = useState(false)
  const ivrEndRef                         = useRef<HTMLDivElement>(null)

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const question  = EXAM_QUESTIONS[currentQ]

  // Camera
  const startCamera = useCallback(async () => {
    try {
      setCamError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setChecks(c => ({ ...c, camera: true }))
    } catch { setCamError('Camera access denied. Please allow and refresh.') }
  }, [])

  // Fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
      setChecks(c => ({ ...c, fullscreen: true }))
    } catch { setChecks(c => ({ ...c, fullscreen: false })) }
  }, [])

  useEffect(() => { setChecks(c => ({ ...c, network: navigator.onLine })) }, [])

  // ── Sync state to localStorage so interviewer can read it ─────────────────
  useEffect(() => {
    if (phase !== 'live') return
    localStorage.setItem(LS.currentQ,   String(currentQ))
    localStorage.setItem(LS.timeLeft,   String(timeLeft))
    localStorage.setItem(LS.status,     'active')
    localStorage.setItem(LS.violations, JSON.stringify(violations))
  }, [phase, currentQ, timeLeft, violations])

  useEffect(() => {
    if (phase !== 'live') return
    Object.entries(answers).forEach(([q, a]) => {
      localStorage.setItem(LS.answer(Number(q)), a)
    })
  }, [answers, phase])

  // ── Listen for interviewer questions from localStorage ────────────────────
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LS.ivrQs && e.newValue) {
        const qs: IvrQuestion[] = JSON.parse(e.newValue)
        setIvrQuestions(qs)
        setNewIvrBadge(n => n + 1)
        ivrEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('storage', handler)
    // Also load any existing questions
    const existing = localStorage.getItem(LS.ivrQs)
    if (existing) setIvrQuestions(JSON.parse(existing))
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Proctoring
  const addViolation = useCallback((type: string) => {
    const now = new Date().toLocaleTimeString()
    setViolations(v => {
      const exists = v.find(x => x.type === type)
      const updated = exists
        ? v.map(x => x.type === type ? { ...x, count: x.count + 1, time: now } : x)
        : [...v, { type, time: now, count: 1 }]
      localStorage.setItem(LS.violations, JSON.stringify(updated))
      return updated
    })
    setViolationFlash(true)
    setTimeout(() => setViolationFlash(false), 1000)
    setShowWarning(`⚠️ ${type} detected!`)
    setTimeout(() => setShowWarning(null), 4000)
  }, [])

  useEffect(() => {
    if (phase !== 'live') return
    const onBlur = () => addViolation('Tab switch / Window leave')
    const onVis  = () => { if (document.hidden) addViolation('Tab switch / Window leave') }
    const onFs   = () => { if (!document.fullscreenElement) { addViolation('Fullscreen exited'); requestFullscreen() } }
    const noCopy = (e: ClipboardEvent) => { e.preventDefault(); addViolation('Copy attempt') }
    const noPaste= (e: ClipboardEvent) => { e.preventDefault(); addViolation('Paste attempt') }
    const noCtx  = (e: MouseEvent)     => { e.preventDefault(); addViolation('Right-click attempt') }
    const noKeys = (e: KeyboardEvent)  => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey) || (e.ctrlKey && ['u','U'].includes(e.key)) || e.key === 'PrintScreen') {
        e.preventDefault(); addViolation('Dev tools / Screenshot attempt')
      }
    }
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVis)
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('copy', noCopy)
    document.addEventListener('paste', noPaste)
    document.addEventListener('contextmenu', noCtx)
    document.addEventListener('keydown', noKeys)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVis)
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('copy', noCopy)
      document.removeEventListener('paste', noPaste)
      document.removeEventListener('contextmenu', noCtx)
      document.removeEventListener('keydown', noKeys)
    }
  }, [phase, addViolation, requestFullscreen])

  // Timer
  useEffect(() => {
    if (phase !== 'live') return
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(question.timeLimit * 60)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleNextQuestion(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQ])

  const fmtTime = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleAnswerChange = (val: string) => {
    setAnswers(a => ({ ...a, [currentQ]: val }))
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length)
    localStorage.setItem(LS.answer(currentQ), val)
  }

  const handleNextQuestion = () => {
    if (currentQ < EXAM_QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1)
      setWordCount(answers[currentQ + 1]?.trim().split(/\s+/).filter(Boolean).length ?? 0)
    } else handleSubmit()
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (document.fullscreenElement) document.exitFullscreen()
    localStorage.setItem(LS.status, 'submitted')
    setPhase('submitted')
  }

  // Reply to interviewer question
  const sendReply = (qId: string) => {
    const text = replyValues[qId]?.trim()
    if (!text) return
    const resp: IvrResponse = { questionId: qId, text }
    const existing: IvrResponse[] = JSON.parse(localStorage.getItem(LS.ivrResps) || '[]')
    const updated = [...existing.filter(r => r.questionId !== qId), resp]
    localStorage.setItem(LS.ivrResps, JSON.stringify(updated))
    setReplyValues(r => ({ ...r, [qId]: '' }))
  }

  const timerPct   = timeLeft > 0 ? (timeLeft / (question.timeLimit * 60)) * 100 : 0
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 20 ? '#f59e0b' : '#ef4444'
  const totalViol  = violations.reduce((s, v) => s + v.count, 0)

  // ════════════════════════════════════════════════════════════════════════════
  // INTRO
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'intro') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl max-w-2xl w-full p-10 text-white text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-sm mb-6">
          <Shield size={14}/> Proctored Assessment
        </div>
        <h1 className="text-3xl font-bold mb-2">PM Qualification Test</h1>
        <p className="text-slate-400 mb-8">Powered by Prodsnap.in · AI-Evaluated · India-Context</p>
        <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
          {[
            { icon: <Clock size={20}/>,         label: '3 Questions',  sub: '50 min total' },
            { icon: <Eye size={20}/>,            label: 'Proctored',   sub: 'Camera + browser monitoring' },
            { icon: <MessageSquare size={20}/>,  label: 'Live Q&A',    sub: 'Interviewer can ask questions' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-blue-400 mb-2 flex justify-center">{item.icon}</div>
              <div className="font-semibold">{item.label}</div>
              <div className="text-slate-400 text-xs mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-left text-sm text-amber-200 mb-8 space-y-1">
          <p className="font-semibold text-amber-300 mb-2">⚠️ Rules:</p>
          <p>• Do not switch tabs — all violations are logged.</p>
          <p>• Keep your face visible in the camera at all times.</p>
          <p>• Copy-paste and right-click are disabled.</p>
          <p>• The interviewer may send clarifying questions — check the panel.</p>
        </div>
        <button onClick={() => setPhase('systemcheck')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
          Begin System Check <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // SYSTEM CHECK
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'systemcheck') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl max-w-2xl w-full p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-1">System Check</h2>
        <p className="text-slate-400 text-sm mb-8">Complete all checks before the exam begins.</p>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Camera size={18} className="text-blue-400"/><span className="font-medium">Webcam</span></div>
            {checks.camera
              ? <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle2 size={16}/> Ready</span>
              : <span className="flex items-center gap-1 text-slate-400 text-sm"><XCircle size={16}/> Not started</span>}
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden h-40 flex items-center justify-center">
            {checks.camera
              ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>
              : <div className="text-slate-500 flex flex-col items-center gap-2"><Camera size={32}/><span className="text-sm">Camera not active</span></div>}
            {checks.camera && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>LIVE
              </div>
            )}
          </div>
          {camError && <p className="text-red-400 text-xs mt-2">{camError}</p>}
          {!checks.camera && (
            <button onClick={startCamera} className="mt-3 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-medium transition">Allow Camera Access</button>
          )}
        </div>
        <div className="space-y-3 mb-8">
          {[
            { icon: <Maximize size={16}/>, label: 'Fullscreen Mode', ok: checks.fullscreen, action: requestFullscreen, actionLabel: 'Enable Fullscreen' },
            { icon: <Wifi size={16}/>,     label: 'Internet Connection', ok: checks.network, action: null, actionLabel: '' },
            { icon: <Cpu size={16}/>,      label: 'Browser Compatible', ok: true, action: null, actionLabel: '' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3"><span className="text-blue-400">{item.icon}</span><span className="text-sm">{item.label}</span></div>
              {item.ok
                ? <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle2 size={16}/> Ready</span>
                : item.action
                  ? <button onClick={item.action} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition">{item.actionLabel}</button>
                  : <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle size={16}/> Failed</span>}
            </div>
          ))}
        </div>
        <button disabled={!checks.camera || !checks.network}
          onClick={async () => { await requestFullscreen(); setPhase('live') }}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
          <Lock size={18}/> {checks.camera && checks.network ? 'Start Proctored Exam' : 'Complete All Checks First'}
        </button>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // LIVE EXAM
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'live') return (
    <div className={`min-h-screen bg-slate-950 text-white flex flex-col select-none ${violationFlash ? 'outline outline-4 outline-red-500' : ''}`}>

      {/* Warning banner */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-bounce">
          <AlertTriangle size={18}/>{showWarning}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-blue-400"/>
          <span className="font-bold text-blue-300 text-sm">Prodsnap.in</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-sm">PM Assessment</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${totalViol > 0 ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-green-900/40 border-green-700 text-green-300'}`}>
            <AlertTriangle size={12}/>{totalViol} violation{totalViol !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full">
            <Clock size={14} style={{ color: timerColor }}/>
            <span className="font-mono text-sm font-bold" style={{ color: timerColor }}>{fmtTime(timeLeft)}</span>
          </div>
          {/* Interviewer Q badge */}
          <button
            onClick={() => { setShowIvrPanel(s => !s); setNewIvrBadge(0) }}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${showIvrPanel ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-900/30 border-purple-700/40 text-purple-300 hover:bg-purple-800/40'}`}
          >
            <MessageSquare size={14}/>
            Interviewer
            {newIvrBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">{newIvrBadge}</span>
            )}
          </button>
          <div className="text-xs text-slate-400">Q {currentQ+1}/{EXAM_QUESTIONS.length}</div>
        </div>
        <div className="relative">
          <video ref={videoRef} autoPlay muted playsInline className="w-24 h-16 rounded-lg object-cover border-2 border-blue-600"/>
          <div className="absolute top-1 left-1 flex items-center gap-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>REC
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-slate-800">
        <div className="h-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }}/>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Question */}
        <div className="w-[30%] border-r border-slate-800 p-6 overflow-y-auto flex-shrink-0">
          <div className="inline-block bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1 rounded-full mb-3">{question.category}</div>
          <p className="text-slate-500 text-xs mb-2">Question {currentQ+1} of {EXAM_QUESTIONS.length}</p>
          <p className="text-white text-sm leading-relaxed mb-6 font-medium">{question.question}</p>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-2 font-semibold tracking-widest uppercase">Structure hints</p>
            {question.hints.map((h,i) => (
              <p key={i} className="text-xs text-slate-400 flex items-start gap-2 mb-1">
                <span className="text-blue-400 font-bold">{i+1}.</span>{h}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-6">
            {EXAM_QUESTIONS.map((_,i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-blue-500' : 'bg-slate-700'}`}/>
            ))}
          </div>
        </div>

        {/* Answer area */}
        <div className="flex-1 flex flex-col p-6 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-slate-400 font-medium">Your Answer</label>
            <span className={`text-xs px-2 py-1 rounded-full ${wordCount < 80 ? 'text-amber-400 bg-amber-400/10' : 'text-green-400 bg-green-400/10'}`}>
              {wordCount} words {wordCount < 80 ? '(aim 80–200)' : '✓'}
            </span>
          </div>
          <textarea
            value={answers[currentQ] ?? ''}
            onChange={e => handleAnswerChange(e.target.value)}
            onCopy={e => e.preventDefault()}
            onPaste={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-5 text-sm text-slate-200 resize-none focus:outline-none focus:border-blue-500 leading-relaxed placeholder-slate-600"
            placeholder="Start typing your structured answer here..."
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-slate-600 flex items-center gap-1"><EyeOff size={12}/> Copy-paste disabled · Tab-switch monitored</div>
            <button onClick={handleNextQuestion}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
              {currentQ < EXAM_QUESTIONS.length-1 ? <>Next <ChevronRight size={16}/></> : <>Submit <CheckCircle2 size={16}/></>}
            </button>
          </div>
        </div>

        {/* ── Interviewer Q&A Panel ─────────────────────────────────────────── */}
        {showIvrPanel && (
          <div className="w-72 border-l border-purple-900/40 bg-purple-950/20 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-purple-900/40 flex items-center gap-2">
              <MessageSquare size={14} className="text-purple-400"/>
              <span className="text-purple-300 text-sm font-semibold">Interviewer Questions</span>
              <span className="ml-auto text-xs text-slate-500">{ivrQuestions.length} msg{ivrQuestions.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ivrQuestions.length === 0 && (
                <div className="text-center text-slate-600 text-xs mt-8">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-30"/>
                  No questions from interviewer yet.<br/>They will appear here in real-time.
                </div>
              )}
              {ivrQuestions.map(q => {
                const resp = JSON.parse(localStorage.getItem(LS.ivrResps) || '[]')
                  .find((r: IvrResponse) => r.questionId === q.id)
                return (
                  <div key={q.id} className="space-y-2">
                    {/* Interviewer question bubble */}
                    <div className="bg-purple-900/40 border border-purple-800/30 rounded-xl rounded-tl-none p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-purple-400 text-xs font-semibold">Interviewer</span>
                        <span className="text-slate-600 text-xs">· {q.timestamp}</span>
                      </div>
                      <p className="text-sm text-purple-100">{q.text}</p>
                    </div>

                    {/* Candidate reply (sent) */}
                    {resp && (
                      <div className="bg-blue-900/30 border border-blue-800/30 rounded-xl rounded-tr-none p-3 ml-4">
                        <div className="text-blue-400 text-xs font-semibold mb-1">You</div>
                        <p className="text-sm text-blue-100">{resp.text}</p>
                      </div>
                    )}

                    {/* Reply input */}
                    {!resp && (
                      <div className="ml-4 flex gap-2">
                        <input
                          value={replyValues[q.id] || ''}
                          onChange={e => setReplyValues(r => ({ ...r, [q.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') sendReply(q.id) }}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          placeholder="Type your reply..."
                        />
                        <button onClick={() => sendReply(q.id)}
                          className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-2 transition">
                          <Send size={12}/>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={ivrEndRef}/>
            </div>
          </div>
        )}

        {/* Violations sidebar */}
        {violations.length > 0 && !showIvrPanel && (
          <div className="w-52 border-l border-slate-800 p-4 flex-shrink-0">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <AlertTriangle size={12}/> Violations
            </p>
            <div className="space-y-2">
              {violations.map((v,i) => (
                <div key={i} className="bg-red-900/20 border border-red-800/40 rounded-lg p-2">
                  <p className="text-red-300 text-xs font-medium">{v.type}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{v.time} · ×{v.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // SUBMITTED
  // ════════════════════════════════════════════════════════════════════════════
  const elapsed  = Math.floor((new Date().getTime() - examStartTime.getTime()) / 60000)
  const answered = Object.values(answers).filter(a => a.trim().length > 50).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl max-w-lg w-full p-10 text-white text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-green-400"/>
        </div>
        <h2 className="text-2xl font-bold mb-2">Exam Submitted!</h2>
        <p className="text-slate-400 text-sm mb-8">Your responses are being AI-evaluated. The recruiter report is ready.</p>
        <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
          {[
            { label: 'Questions', value: `${answered}/${EXAM_QUESTIONS.length}` },
            { label: 'Time Taken', value: `${elapsed} min` },
            { label: 'Violations', value: totalViol.toString() },
          ].map((stat,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className={`text-xl font-bold ${stat.label==='Violations' && totalViol>0 ? 'text-red-400' : 'text-blue-300'}`}>{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        {totalViol > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left mb-6 text-sm">
            <p className="text-red-300 font-semibold mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Integrity Report</p>
            {violations.map((v,i) => <p key={i} className="text-red-400/80 text-xs">• {v.type} (×{v.count})</p>)}
          </div>
        )}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200">
          <p className="font-semibold mb-1">What happens next?</p>
          <p className="text-blue-300/70 text-xs">Prodsnap AI evaluates each answer on 5 rubric dimensions. The recruiter receives a full scorecard PDF with scores, strengths, improvement areas, and integrity summary.</p>
        </div>
      </div>
    </div>
  )
}
