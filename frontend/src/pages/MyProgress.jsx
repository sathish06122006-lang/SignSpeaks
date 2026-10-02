import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

const chartTextColor = 'rgba(253, 246, 236, 0.85)'

const EMPTY_DASHBOARD_SUMMARY = {
  total_signs_detected: 0,
  accuracy_percent: 0,
  practice_time_minutes: 0,
  weekly_progress: [],
  category_breakdown: [],
}

const EMPTY_PRACTICE_SUMMARY = {
  has_data: false,
  signs_practiced: 0,
  total_sessions: 0,
  accuracy_percent: 0,
  average_confidence: null,
  streak_days: 0,
  most_practiced: [],
  difficult_signs: [],
  daily_accuracy: [],
  daily_activity: [],
  recent_activity: [],
}

function StatCard({ label, value, sub, icon, tone }) {
  return (
    <div className="glass rounded-2xl p-5 card-lift">
      {icon && <div className={`text-2xl mb-2 ${tone}`}>{icon}</div>}
      <p className="text-xs uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-gradient">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  )
}

export default function MyProgress() {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD_SUMMARY)
  const [practice, setPractice] = useState(EMPTY_PRACTICE_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.get('/api/dashboard/summary'),
      api.get('/api/progress/summary'),
    ])
      .then(([dashRes, progRes]) => {
        if (!active) return
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data ?? EMPTY_DASHBOARD_SUMMARY)
        if (progRes.status === 'fulfilled') setPractice(progRes.value.data ?? EMPTY_PRACTICE_SUMMARY)
        if (dashRes.status === 'rejected' && progRes.status === 'rejected') {
          setError('Could not load your progress — please check your connection and try again.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold mb-4">My Progress</h1>
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-coralDeep/40 bg-coralDeep/10 px-4 py-3 text-sm text-coralDeep"
        >
          <FiAlertCircle className="shrink-0" /> {error}
        </div>
      </div>
    )
  }

  // Fresh learner with no activity on either data source — single call-to-action.
  if (!practice.has_data && dashboard.total_signs_detected === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold mb-6">My Progress</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <FiActivity className="text-5xl mx-auto mb-4 opacity-60" />
          <h2 className="font-display text-2xl font-bold mb-2">No progress data yet</h2>
          <p className="opacity-70 mb-6 max-w-md mx-auto">
            Start practising signs with the camera and your real attempts, accuracy, detections,
            and streaks will appear here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/practice"
              className="inline-flex px-6 py-3 btn-primary"
            >
              Start Practicing →
            </Link>
            <Link
              to="/live-detection"
              className="inline-flex px-6 py-3 btn-secondary"
            >
              Try Live Detection
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const weeklyLabels = dashboard.weekly_progress.map((d) => d.date)
  const weeklyCounts = dashboard.weekly_progress.map((d) => d.count)
  const categoryLabels = dashboard.category_breakdown.map((c) => c.category)
  const categoryCounts = dashboard.category_breakdown.map((c) => c.count)
  const accLabels = practice.daily_accuracy.map((d) => d.date.slice(5))
  const accValues = practice.daily_accuracy.map((d) => (d.accuracy === null ? null : d.accuracy))
  const actValues = practice.daily_activity.map((d) => d.attempts)

  const commonOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: chartTextColor } } },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  const pieOptions = { plugins: { legend: { labels: { color: chartTextColor } } } }

  const detectionCards = [
    { label: 'Total Signs Detected', value: dashboard.total_signs_detected, icon: <FiActivity />, tone: 'text-brandGreen' },
    { label: 'Accuracy', value: `${dashboard.accuracy_percent}%`, sub: 'avg. confidence', icon: <FiTrendingUp />, tone: 'text-brandGreen' },
    { label: 'Practice Time', value: `${dashboard.practice_time_minutes} min`, icon: <FiTarget />, tone: 'text-violet' },
    { label: 'Daily Progress', value: weeklyCounts.at(-1) ?? 0, sub: 'signs today', icon: <FiTrendingUp />, tone: 'text-violet' },
  ]

  const practiceCards = [
    { label: 'Signs Practiced', value: practice.signs_practiced, icon: <FiTarget />, tone: 'text-violet' },
    { label: 'Practice Sessions', value: practice.total_sessions, icon: <FiActivity />, tone: 'text-violet' },
    {
      label: 'Average Confidence',
      value: practice.average_confidence !== null ? `${Math.round(practice.average_confidence)}%` : 'Unavailable',
      icon: <FiAward />,
      tone: 'text-brandGreen',
    },
    { label: 'Learning Streak', value: `${practice.streak_days} Day${practice.streak_days === 1 ? '' : 's'}`, icon: <FiAward />, tone: 'text-coral' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h1 className="font-display text-3xl font-bold">My Progress</h1>
        <Link
          to="/practice"
          className="px-4 py-2 text-sm btn-primary"
        >
          Practise now
        </Link>
      </div>
      <p className="opacity-70 mb-8">
        Real analytics from your live detections and saved practice sessions — no placeholder numbers.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 [perspective:1200px]">
        {detectionCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 [perspective:1200px]">
        {practiceCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Weekly Progress</h3>
          {weeklyLabels.length ? (
            <Line
              options={commonOptions}
              data={{
                labels: weeklyLabels,
                datasets: [
                  {
                    label: 'Signs Detected',
                    data: weeklyCounts,
                    borderColor: '#4ADE9B',
                    backgroundColor: 'rgba(74,222,155,0.15)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
            />
          ) : (
            <p className="opacity-60 text-sm">Start detecting signs to see your weekly progress here.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 card-lift">
          <h3 className="font-display font-semibold mb-4">Sign Category Breakdown</h3>
          {categoryLabels.length ? (
            <Pie
              data={{
                labels: categoryLabels,
                datasets: [
                  {
                    data: categoryCounts,
                    backgroundColor: ['#4ADE9B', '#7C7FF2', '#FF6B5B', '#E8503F'],
                  },
                ],
              }}
              options={pieOptions}
            />
          ) : (
            <p className="opacity-60 text-sm">No category data yet.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-3 xl:col-span-2">
          <h3 className="font-display font-semibold mb-4">Accuracy Over Time (last 14 days)</h3>
          {accLabels.length && accValues.some((v) => v !== null) ? (
            <Line
              options={commonOptions}
              data={{
                labels: accLabels,
                datasets: [
                  {
                    label: 'Accuracy %',
                    data: accValues,
                    borderColor: '#4ADE9B',
                    backgroundColor: 'rgba(74,222,155,0.15)',
                    tension: 0.4,
                    fill: true,
                    spanGaps: true,
                  },
                ],
              }}
            />
          ) : (
            <p className="opacity-60 text-sm">Practise a few signs to see your accuracy trend here.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 card-lift">
          <h3 className="font-display font-semibold mb-4">Most Practiced Signs</h3>
          {practice.most_practiced.length ? (
            <div className="space-y-3">
              {practice.most_practiced.map((m, i) => (
                <div key={m.sign} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm opacity-60">{i + 1}.</span>
                  <span className="text-sm font-semibold flex-1">{m.sign}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brandGreen/20 text-brandGreen font-semibold">
                    {m.count}×
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">Not enough data yet.</p>
          )}
        </div>

      <div className="glass rounded-2xl p-5 lg:col-span-3 xl:col-span-2">
          <h3 className="font-display font-semibold mb-4">Practice Activity (attempts per day)</h3>
          {actValues.some((v) => v > 0) ? (
            <Bar
              options={commonOptions}
              data={{
                labels: accLabels,
                datasets: [
                  {
                    label: 'Attempts',
                    data: actValues,
                    backgroundColor: '#7C7FF2',
                    borderRadius: 6,
                  },
                ],
              }}
            />
          ) : (
            <p className="opacity-60 text-sm">No practice activity yet.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 card-lift">
          <h3 className="font-display font-semibold mb-4">Difficult Signs</h3>
          {practice.difficult_signs.length ? (
            <div className="space-y-3">
              {practice.difficult_signs.map((s) => (
                <div key={s.sign} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold flex-1">{s.sign}</span>
                  <span className="text-xs opacity-60">{s.attempts} attempts</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.accuracy < 50 ? 'bg-coralDeep/20 text-coralDeep' : 'bg-white/10 opacity-80'
                    }`}
                  >
                    {s.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">Practise a sign at least twice to see difficulty here.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-3">
          <h3 className="font-display font-semibold mb-4">Detections by Day</h3>
          {weeklyLabels.length ? (
            <Bar
              options={commonOptions}
              data={{
                labels: weeklyLabels,
                datasets: [
                  {
                    label: 'Detections',
                    data: weeklyCounts,
                    backgroundColor: '#7C7FF2',
                    borderRadius: 6,
                  },
                ],
              }}
            />
          ) : (
            <p className="opacity-60 text-sm">No daily data yet.</p>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 card-lift">
        <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
        {practice.recent_activity.length ? (
          <div className="space-y-2">
            {practice.recent_activity.map((r, i) => (
              <div
                key={`${r.timestamp}-${i}`}
                className="flex items-center gap-3 text-sm border-b border-white/5 py-2 last:border-0"
              >
                <span
                  className={
                    r.result === 'correct'
                      ? 'text-brandGreen'
                      : r.result === 'unclear'
                      ? 'text-coral' : 'text-coralDeep'
                  }
                >
                  {r.result === 'correct' ? <FiCheckCircle /> : r.result === 'unclear' ? <FiAlertCircle /> : <FiXCircle />}
                </span>
                <span className="font-semibold w-24 truncate">{r.target}</span>
                <span className="opacity-70 text-xs flex-1">
                  detected {r.detected || '—'} · {r.confidence > 0 ? `${Math.round(r.confidence * 100)}%` : 'conf. n/a'}
                </span>
                <span className="opacity-60 text-xs">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-60">No recent practice recorded.</p>
        )}
      </div>
    </div>
  )
}
