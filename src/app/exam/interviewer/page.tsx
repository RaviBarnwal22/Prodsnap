'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Shield, Send, AlertTriangle, Clock, MessageSquare,
  Eye, User, FileText, CheckCircle2, Circle, Monitor
} from 'lucide-react'

const EXAM_QUESTIONS = [
  {
    id: 1, category: 'Product Sense', timeLimit: 20,
    question: "You are the PM for Swiggy Instamart. Grocery delivery adoption in Tier-2 cities is 60% lower than metros. Walk me through how you would approach this problem, define success metrics, and propose your top 3 solutions.",
  },
  {
    id: 2, category: 'Metrics & Execution', timeLimit: 15,
    question: "CRED's 7-day retention has dropped from 42% to 28% in the last quarter. How do you diagnose the root cause?",
  },
  {
    id: 3, category: 'Strategy', timeLimit: 15,
    question: "PhonePe wants to enter B2B payments. Should they build, buy, or partner?",
  },
]

const LS = {
  currentQ:   'ps_exam_current_q',
  timeLeft:   'ps_exam_time_left',
  answer:     (q: number) => `ps_exam_answer_${q}`,
  violations: 'ps_exam_violations',
  status:     'ps_exam_status',
  ivrQs:      'ps_ivr_questions',
  ivrResps:   'ps_ivr_responses',
}

interface IvrQuestion { id: string; text: string; timestamp: string }
interface IvrResponse { questionId: string; text: string }
interface Violation   { type: string; time: string; count: number }

const QUICK_QUESTIONS = [
  "Can you clarify which user segment you're focusing on?",
  "What assumptions are you making about the market?",
  "How would you prioritise between those solutions?",
  "How would you measure success for this?",
  "What trade-offs do you see with your approach?",
  "Can you give a concrete India-specific example?",
  "What would you build in the first 30 days?",
  "How does this differ from what competitors are doing?",
]

export default function InterviewerHubPage() {
  const [candidateQ,   setCandidateQ]   = useState(0)
  const [timeLeft,     setTimeLeft]     = useState(0)
  const [liveAnswer,   setLiveAnswer]   = useState('')
  const [violations,   setViolations]   = useState<Violation[]>([])
  const [examStatus,   setExamStatus]   = useState<'waiting'|'active'|'submitted'>('waiting')
  const [ivrQs,        setIvrQs]        = useState<IvrQuestion[]>([])
  const [ivrResps,     setIvrResps]     = useState<IvrResponse[]>([])
  const [newQuestion,  setNewQuestion]  = useState('')
  const [notes,        setNotes]        = useState('')
  const [activeTab,    setActiveTab]    = useState<'chat'|'answer'|'notes'>('chat')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Poll localStorage every second ───────────────────────────────────────
  useEffect(() => {
    function syncFromLS() {
      const status = localStorage.getItem(LS.status) as any
      setExamStatus(status === 'active' ? 'active' : status === 'submitted' ? 'submitted' : 'waiting')
      const qIdx = parseInt(localStorage.getItem(LS.currentQ) || '0')
      setCandidateQ(qIdx)
      const tl = parseInt(localStorage.getItem(LS.timeLeft) || '0')
      setTimeLeft(tl)
      const ans = localStorage.getItem(LS.answer(qIdx)) || ''
      setLiveAnswer(ans)
      const viols = JSON.parse(localStorage.getItem(LS.violations) || '[]')
      setViolations(viols)
      const resps = JSON.parse(localStorage.getItem(LS.ivrResps) || '[]')
      setIvrResps(resps)
    }
    syncFromLS()
    pollRef.current = setInterval(syncFromLS, 800)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ivrQs, ivrResps])

  const fmtTime = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const totalViol = violations.reduce((s,v) => s + v.count, 0)
  const wordCount = liveAnswer.trim().split(/\s+/).filter(Boolean).length
  const question  = EXAM_QUESTIONS[candidateQ]

  const sendQuestion = (text: string) => {
    if (!text.trim()) return
    const q: IvrQuestion = {
      id:        Date.now().toString(),
      text:      text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    }
    const updated = [...ivrQs, q]
    setIvrQs(updated)
    localStorage.setItem(LS.ivrQs, JSON.stringify(updated))
    setNewQuestion('')
  }

  const timerPct   = timeLeft > 0 && question ? (timeLeft / (question.timeLimit * 60)) * 100 : 0
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 20 ? '#f59e0b' : '#ef4444'

  // ── STATUS BAR ────────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (examStatus === 'waiting')   return <span className="flex items-center gap-1.5 text-slate-400 text-xs"><Circle size={8} className="fill-slate-600 text-slate-600"/> Waiting for candidate</span>
    if (examStatus === 'active')    return <span className="flex items-center gap-1.5 text-green-400 text-xs"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> Exam in progress</span>
    if (examStatus === 'submitted') return <span className="flex items-center gap-1.5 text-blue-400 text-xs"><CheckCircle2 size={12}/> Submitted</span>
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-purple-400"/>
          <span className="font-bold text-purple-300">Prodsnap.in</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 text-sm font-medium">Interviewer Hub</span>
        </div>
        <StatusBadge/>
        <div className="flex items-center gap-3">
          <div className={`text-xs px-3 py-1 rounded-full border ${totalViol > 0 ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-green-900/30 border-green-800 text-green-400'}`}>
            {totalViol > 0 ? `⚠️ ${totalViol} violations` : '✓ Clean session'}
          </div>
          <a href="/exam" target="_blank"
            className="flex items-center gap-1.5 text-xs bg-blue-900/30 border border-blue-800/40 text-blue-300 hover:bg-blue-800/40 px-3 py-1.5 rounded-lg transition">
            <Monitor size={12}/> Candidate View ↗
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Candidate Status ───────────────────────────────────────── */}
        <div className="w-72 border-r border-slate-800 flex flex-col flex-shrink-0">

          {/* Question status */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Current Question</p>
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-400 font-medium">{question?.category}</span>
                <span className="text-xs text-slate-500">Q {candidateQ+1}/{EXAM_QUESTIONS.length}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{question?.question}</p>
            </div>
            {/* Q dots */}
            <div className="flex items-center gap-2 mt-3">
              {EXAM_QUESTIONS.map((_,i) => (
                <div key={i} title={EXAM_QUESTIONS[i].category}
                  className={`h-1.5 flex-1 rounded-full transition-all ${i < candidateQ ? 'bg-green-500' : i === candidateQ ? 'bg-blue-500' : 'bg-slate-700'}`}/>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Time Remaining</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }}/>
              </div>
              <span className="font-mono text-sm font-bold tabular-nums" style={{ color: timerColor }}>{fmtTime(timeLeft)}</span>
            </div>
          </div>

          {/* Violations */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Integrity Alerts</p>
            {violations.length === 0
              ? <p className="text-xs text-green-500">✓ No violations recorded</p>
              : <div className="space-y-2">
                  {violations.map((v,i) => (
                    <div key={i} className="flex items-start justify-between bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-red-300 text-xs">{v.type}</p>
                        <p className="text-slate-600 text-xs">{v.time}</p>
                      </div>
                      <span className="bg-red-700 text-white text-xs px-1.5 py-0.5 rounded font-mono">×{v.count}</span>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Word count */}
          <div className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Answer Progress</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{wordCount}</span>
              <span className="text-xs text-slate-500">words typed</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full mt-2">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((wordCount/200)*100, 100)}%`}}/>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0</span><span>80 (min)</span><span>200</span>
            </div>
          </div>
        </div>

        {/* ── CENTER: Main interaction area ────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Tabs */}
          <div className="flex border-b border-slate-800 px-4">
            {([
              { key: 'chat',   label: 'Q&A Chat',       icon: <MessageSquare size={13}/> },
              { key: 'answer', label: "Live Answer",     icon: <Eye size={13}/> },
              { key: 'notes',  label: 'Interview Notes', icon: <FileText size={13}/> },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Q&A Chat ─────────────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ivrQs.length === 0 && examStatus !== 'waiting' && (
                  <div className="text-center text-slate-600 text-sm mt-16">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-20"/>
                    No questions sent yet.<br/>Use the input below to ask clarifying questions.
                  </div>
                )}
                {examStatus === 'waiting' && (
                  <div className="text-center text-slate-600 text-sm mt-16">
                    <Monitor size={32} className="mx-auto mb-3 opacity-20"/>
                    Waiting for the candidate to start the exam.<br/>
                    <span className="text-xs">Open <strong className="text-slate-500">/exam</strong> in another window.</span>
                  </div>
                )}
                {ivrQs.map(q => {
                  const resp = ivrResps.find(r => r.questionId === q.id)
                  return (
                    <div key={q.id} className="space-y-3">
                      {/* Your question */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-xs">
                          <div className="text-right text-xs text-slate-600 mb-1">You · {q.timestamp}</div>
                          <div className="bg-purple-700 text-white text-sm rounded-xl rounded-tr-none p-3">{q.text}</div>
                        </div>
                        <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">I</div>
                      </div>
                      {/* Candidate reply */}
                      {resp && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">C</div>
                          <div className="max-w-xs">
                            <div className="text-xs text-slate-600 mb-1">Candidate</div>
                            <div className="bg-slate-800 text-slate-200 text-sm rounded-xl rounded-tl-none p-3">{resp.text}</div>
                          </div>
                        </div>
                      )}
                      {!resp && (
                        <div className="flex items-center gap-2 ml-11">
                          <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-pulse"/>
                          <span className="text-xs text-slate-600">Waiting for candidate reply...</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={chatEndRef}/>
              </div>

              {/* Quick questions */}
              <div className="px-6 pb-2">
                <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q,i) => (
                    <button key={i} onClick={() => sendQuestion(q)}
                      className="text-xs bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-700 text-slate-400 hover:text-purple-300 px-2.5 py-1 rounded-full transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send input */}
              <div className="p-4 border-t border-slate-800 flex gap-3">
                <input
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuestion(newQuestion) } }}
                  disabled={examStatus !== 'active'}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-40"
                  placeholder={examStatus === 'active' ? "Type a clarifying question and press Enter..." : "Exam not started yet"}
                />
                <button
                  onClick={() => sendQuestion(newQuestion)}
                  disabled={!newQuestion.trim() || examStatus !== 'active'}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl px-4 transition flex items-center gap-2 text-sm font-medium">
                  <Send size={15}/> Send
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: Live Answer ──────────────────────────────────────────── */}
          {activeTab === 'answer' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-200">Live Answer Feed</h3>
                  <p className="text-xs text-slate-500">Updates in real-time as candidate types</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-64">
                {liveAnswer
                  ? <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{liveAnswer}</p>
                  : <p className="text-slate-600 text-sm italic">Candidate hasn't started typing yet...</p>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Words', value: wordCount, good: wordCount >= 80 },
                  { label: 'Paragraphs', value: liveAnswer.split('\n\n').filter(Boolean).length, good: liveAnswer.split('\n\n').filter(Boolean).length >= 2 },
                  { label: 'Violations', value: totalViol, good: totalViol === 0 },
                ].map((stat,i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${stat.good ? 'text-green-400' : 'text-amber-400'}`}>{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: Notes ───────────────────────────────────────────────── */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-200">Interview Notes</h3>
                  <p className="text-xs text-slate-500">Private notes — not visible to candidate</p>
                </div>
                <span className="text-xs text-slate-600">{notes.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 text-sm text-slate-200 resize-none focus:outline-none focus:border-purple-500 leading-relaxed placeholder-slate-600"
                placeholder={`Notes for Q${candidateQ+1}:\n\n• First impression:\n• Structure quality:\n• India context:\n• Solution creativity:\n• Communication:\n\nOverall hiring signal:`}
              />
              {/* Scoring quick-fill */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {['Problem Understanding', 'Structure', 'India Context', 'Solution Quality', 'Communication'].map((dim,i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-2 leading-tight">{dim}</p>
                    <div className="flex gap-1 justify-center">
                      {[1,2,3,4,5].map(score => (
                        <button key={score}
                          onClick={() => setNotes(n => n + `\n${dim}: ${score}/5`)}
                          className="w-4 h-4 rounded-sm bg-slate-800 hover:bg-purple-600 text-xs flex items-center justify-center transition">
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Quick Actions ─────────────────────────────────────────── */}
        <div className="w-56 border-l border-slate-800 flex flex-col p-4 flex-shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Hiring Signals</p>
          <div className="space-y-2 mb-6">
            {[
              { label: 'Strong Hire',     color: 'bg-green-900/40 border-green-700/40 text-green-300  hover:bg-green-800/40' },
              { label: 'Hire',            color: 'bg-blue-900/40  border-blue-700/40  text-blue-300   hover:bg-blue-800/40'  },
              { label: 'Maybe',           color: 'bg-amber-900/40 border-amber-700/40 text-amber-300  hover:bg-amber-800/40' },
              { label: 'No Hire',         color: 'bg-red-900/40   border-red-700/40   text-red-300    hover:bg-red-800/40'   },
              { label: 'Strong No Hire',  color: 'bg-slate-800    border-slate-700    text-slate-400  hover:bg-slate-700'    },
            ].map((opt,i) => (
              <button key={i}
                onClick={() => setNotes(n => n + `\n\n[HIRING SIGNAL: ${opt.label}]`)}
                className={`w-full text-xs py-2 rounded-lg border transition ${opt.color}`}>
                {opt.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Exam Progress</p>
          <div className="space-y-2 mb-6">
            {EXAM_QUESTIONS.map((q,i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${i < candidateQ ? 'bg-green-500' : i === candidateQ ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}/>
                <span className={`text-xs ${i === candidateQ ? 'text-slate-200' : 'text-slate-500'}`}>{q.category}</span>
                {i < candidateQ && <CheckCircle2 size={10} className="text-green-500 ml-auto"/>}
              </div>
            ))}
          </div>

          {examStatus === 'submitted' && (
            <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-3">
              <p className="text-blue-300 text-xs font-semibold mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Submitted</p>
              <p className="text-slate-500 text-xs">AI scoring in progress. Report will be ready shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
