import { AlertTriangle, TrendingDown, Users, Repeat, Clock, Mail, CreditCard, Cpu, Activity } from "lucide-react"
import type { AdminMetrics, WindowMetrics, FunnelStep } from "@/lib/admin-metrics"

const fmtPct = (n: number | null) => (n === null ? "n/a" : `${n}%`)

/**
 * The logged-event funnel. Separate card rather than extra rows on the pageview
 * funnel, because the two are not the same measurement: this one counts events
 * and only has data from the day tracking was added, so mixing them in one chart
 * would read as a collapse that never happened.
 */
function EventFunnelCard({ w }: { w: WindowMetrics }) {
    const steps = w.eventFunnel
    const top = steps.find((s) => s.count > 0)?.count || 1
    const hasData = steps.some((s) => s.count > 0)

    // Only consider a drop meaningful when the step above it actually had volume,
    // otherwise an empty funnel reports a misleading "100% drop" everywhere.
    const worst = steps
        .filter((s, i) => s.fromPrev !== null && (steps[i - 1]?.count ?? 0) >= 5)
        .sort((a, b) => (a.fromPrev ?? 100) - (b.fromPrev ?? 100))[0]

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-2">
                <Activity size={14} /> Event funnel · {w.days}d
            </h3>
            <p className="text-[11px] text-gray-500 mb-5">
                Logged events, not pageviews. Counts start from when tracking was added.
            </p>

            <div className="space-y-3">
                {steps.map((s) => (
                    <div key={s.label}>
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="text-xs text-gray-300 font-medium">{s.label}</span>
                            <span className="text-xs text-gray-500 tabular-nums">
                                {s.fromPrev === null ? "" : `${s.fromPrev}%`}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-grow h-5 bg-gray-900 rounded-md overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-md"
                                    style={{ width: `${Math.max((s.count / top) * 100, 1.5)}%` }}
                                />
                            </div>
                            <span className="text-base font-black text-white tabular-nums w-12 text-right">
                                {s.count}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {!hasData && (
                <p className="mt-5 pt-4 border-t border-gray-700 text-xs text-gray-500 leading-relaxed">
                    No events recorded yet in this window. These only populate from the day
                    event tracking was added, so give it a day of traffic.
                </p>
            )}

            {hasData && worst && (
                <div className="mt-5 pt-4 border-t border-gray-700 flex items-start gap-2.5">
                    <TrendingDown size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Biggest drop is into <span className="text-amber-400 font-bold">{worst.label}</span>,
                        where only {worst.fromPrev}% of the previous step continues.
                    </p>
                </div>
            )}
        </div>
    )
}

function FunnelCard({ w }: { w: WindowMetrics }) {
    const top = w.funnel[0].count || 1
    // The step people are most likely to abandon. Worth naming explicitly,
    // since it is the only part of this dashboard that says what to fix next.
    const worst = w.funnel
        .filter((s) => s.fromPrev !== null)
        .sort((a, b) => (a.fromPrev ?? 100) - (b.fromPrev ?? 100))[0]

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">
                Last {w.days} days
            </h3>

            <div className="space-y-4">
                {w.funnel.map((s) => (
                    <div key={s.label}>
                        <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-sm text-gray-300 font-medium">{s.label}</span>
                            <span className="text-sm text-gray-500 tabular-nums">
                                {s.fromPrev === null ? "" : `${s.fromPrev}%`}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-grow h-7 bg-gray-900 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg"
                                    style={{ width: `${Math.max((s.count / top) * 100, 1.5)}%` }}
                                />
                            </div>
                            <span className="text-lg font-black text-white tabular-nums w-14 text-right">
                                {s.count}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {worst && (
                <div className="mt-5 pt-4 border-t border-gray-700 flex items-start gap-2.5">
                    <TrendingDown size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Biggest drop is into <span className="text-amber-400 font-bold">{worst.label}</span>,
                        where only {worst.fromPrev}% of the previous step continues.
                    </p>
                </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-xl p-3">
                    <p className="text-xl font-black text-white tabular-nums">{w.signups}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Signups</p>
                </div>
                <div className="bg-gray-900 rounded-xl p-3">
                    <p className="text-xl font-black text-white tabular-nums">{fmtPct(w.activationRate)}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Activated</p>
                </div>
            </div>
        </div>
    )
}

function Stat({
    icon, value, label, note, tone = "normal",
}: {
    icon: React.ReactNode; value: string; label: string; note?: string; tone?: "normal" | "warn" | "bad"
}) {
    const toneClass =
        tone === "bad" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-white"
    return (
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <div className="text-gray-500 mb-3">{icon}</div>
            <p className={`text-2xl font-black tabular-nums ${toneClass}`}>{value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{label}</p>
            {note && <p className="text-[11px] text-gray-500 mt-2 leading-snug">{note}</p>}
        </div>
    )
}

export function AdminMetricsPanel({ metrics }: { metrics: AdminMetrics }) {
    const { week, month, retention: r, health: h } = metrics

    const slowest = h.ai.reduce((max, a) => Math.max(max, a.p95), 0)
    const aiSlow = slowest > 25000

    return (
        <div className="space-y-8">
            <div className="flex items-start gap-2.5 bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                <Users size={16} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                    Every number below excludes {metrics.excludedAccounts} founder and test accounts.
                    Counts are per window, not since launch, so they can go down as well as up.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-black text-white mb-4">The funnel</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <FunnelCard w={week} />
                    <FunnelCard w={month} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <EventFunnelCard w={week} />
                    <EventFunnelCard w={month} />
                </div>
            </div>

            <div>
                <h2 className="text-lg font-black text-white mb-4">Activation and return</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat
                        icon={<Users size={18} />}
                        value={String(r.totalUsers)}
                        label="Real users"
                        note="Accounts, excluding your own and test rows."
                    />
                    <Stat
                        icon={<Repeat size={18} />}
                        value={fmtPct(r.everSubmittedRate)}
                        label="Ever submitted"
                        note={`${r.everSubmitted} of ${r.totalUsers} have answered at least one case.`}
                        tone={(r.everSubmittedRate ?? 0) < 30 ? "warn" : "normal"}
                    />
                    <Stat
                        icon={<Repeat size={18} />}
                        value={fmtPct(r.repeatRate)}
                        label="Came back for a 2nd"
                        note={`${r.submittedTwicePlus} of ${r.everSubmitted} submitters answered twice or more.`}
                        tone={(r.repeatRate ?? 0) < 30 ? "warn" : "normal"}
                    />
                    <Stat
                        icon={<Clock size={18} />}
                        value={r.medianDaysToFirst === null ? "n/a" : `${r.medianDaysToFirst}d`}
                        label="Signup to 1st case"
                        note="Median. A value of 0 means people who convert do it the same day."
                    />
                </div>
            </div>

            <div>
                <h2 className="text-lg font-black text-white mb-4">Health, last 30 days</h2>

                {aiSlow && (
                    <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-400 mb-1">Evaluations are slow</p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                The slowest 5% of calls take over {Math.round(slowest / 1000)} seconds. Someone
                                who has just written a full case answer is waiting that long for a score, which
                                is a plausible reason the submit step converts as poorly as it does.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Cpu size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">AI providers</span>
                        </div>
                        {h.ai.length === 0 ? (
                            <p className="text-sm text-gray-500">No calls in the last 30 days.</p>
                        ) : (
                            <div className="space-y-3">
                                {h.ai.map((a) => (
                                    <div key={a.provider} className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-gray-300 font-medium">{a.provider}</span>
                                        <div className="flex items-center gap-4 text-xs tabular-nums">
                                            <span className={(a.successRate ?? 100) < 95 ? "text-red-400" : "text-gray-400"}>
                                                {fmtPct(a.successRate)} ok
                                            </span>
                                            <span className="text-gray-500">
                                                p50 {(a.p50 / 1000).toFixed(1)}s
                                            </span>
                                            <span className={a.p95 > 25000 ? "text-amber-400" : "text-gray-500"}>
                                                p95 {(a.p95 / 1000).toFixed(1)}s
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Stat
                            icon={<Mail size={18} />}
                            value={fmtPct(h.email.rate)}
                            label="Email delivered"
                            note={`${h.email.sent} sent, ${h.email.failed} failed.`}
                            tone={(h.email.rate ?? 100) < 95 ? "warn" : "normal"}
                        />
                        <Stat
                            icon={<CreditCard size={18} />}
                            value={String(h.activeSubscriptions)}
                            label="Active subs"
                            note={`${h.bookings.confirmed} confirmed bookings, ${h.bookings.completed} completed.`}
                        />
                        <Stat
                            icon={<AlertTriangle size={18} />}
                            value={String(h.bookings.stalePending)}
                            label="Stale bookings"
                            note="Pending for more than 48 hours. Either abandoned at payment or not processed."
                            tone={h.bookings.stalePending > 0 ? "bad" : "normal"}
                        />
                        <Stat
                            icon={<Cpu size={18} />}
                            value={String(h.demoRuns)}
                            label="Demo runs"
                            note="Homepage live demo evaluations in the window."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
