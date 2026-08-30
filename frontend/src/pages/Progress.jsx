import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { FiActivity, FiTarget, FiTrendingUp, FiAward, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const chartTextColor = '#CBD5E1'

export default function Progress() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/progress/summary')
      .then(({ data }) => setSummary(data))
      .catch(() => setError('Could not load your progress — please check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold mb-4">Progress Dashboard</h1>
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
          <FiAlertCircle className="shrink-0" /> {error}
        </div>
      </div>
    )
  }

  // Empty state — real data only, never fabricated stats.
  if (!summary?.has_data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold mb-6">Progress Dashboard</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <FiActivity className="text-5xl mx-auto mb-4 opacity-60" />
          <h2 className="font-display text-2xl font-bold mb-2">No practice data yet</h2>
          <p className="opacity-70 mb-6 max-w-md mx-auto">
            Start practising signs with the camera and your real attempts, accuracy, and streaks
            will appear here.
          </p>
          <Link
            to="/practice"
            className="inline-flex px-6 py-3 rounded-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition"
          >
            Start Practicing →
          </Link>
        </div>
      </div>
    )
  }

  const accLabels = summary.daily_accuracy.map((d) => d.date.slice(5))
  const accValues = summary.daily_accuracy.map((d) => (d.accuracy === null ? null : d.accuracy))
  const actValues = summary.daily_activity.map((d) => d.attempts)

  const commonOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: chartTextColor } } },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  const statCards = [
    { label: 'Accuracy', value: `${summary.accuracy_percent}%`, icon: <FiTrendingUp />, tone: 'text-teal-light' },
    { label: 'Signs Practiced', value: summary.signs_practiced, icon: <FiTarget />, tone: 'text-indigoAccent-light' },
    { label: 'Practice Sessions', value: summary.total_sessions, icon: <FiActivity />, tone: 'text-indigoAccent-light' },
    { label: 'Average Confidence', value: summary.average_confidence !== null ? `${Math.round(summary.average_confidence)}%` : 'Unavailable', icon: <FiAward />, tone: 'text-teal-light' },
    { label: 'Learning Streak', value: `${summary.streak_days} Day${summary.streak_days === 1 ? '' : 's'}`, icon: <FiAward />, tone: 'text-coral' },
  ]
return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h1 className="font-display text-3xl font-bold">Progress Dashboard</h1>
        <Link
          to="/practice"
          className="px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition"
        >
          Practise now
        </Link>
      </div>
      <p className="opacity-70 mb-8">
        Real analytics from your saved practice sessions — no placeholder numbers.
      </p>

      {/* Overall Progress stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`text-2xl mb-2 ${s.tone}`}>{s.icon}</div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-gradient">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Accuracy over time */}
        <div className="glass rounded-2xl p-5 lg:col-span-3 xl:col-span-2">
          <h3 className="font-display font-semibold mb-4">Accuracy Over Time (last 14 days)</h3>
          <Line
            options={commonOptions}
            data={{
              labels: accLabels,
              datasets: [
                {
                  label: 'Accuracy %',
                  data: accValues,
                  borderColor: '#5EEAD4',
                  backgroundColor: 'rgba(94,234,212,0.2)',
                  tension: 0.4,
                  fill: true,
                  spanGaps: true,
                },
              ],
            }}
          />
        </div>

        {/* Most practiced */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Most Practiced Signs</h3>
          {summary.most_practiced.length ? (
            <div className="space-y-3">
              {summary.most_practiced.map((m, i) => (
                <div key={m.sign} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm opacity-60">{i + 1}.</span>
                  <span className="text-sm font-semibold flex-1">{m.sign}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal/20 text-teal-light font-semibold">
                    {m.count}×
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-50">Not enough data yet.</p>
          )}
        </div>

        {/* Activity bar */}
        <div className="glass rounded-2xl p-5 lg:col-span-3 xl:col-span-2">
          <h3 className="font-display font-semibold mb-4">Practice Activity (attempts per day)</h3>
          <Bar
            options={commonOptions}
            data={{
              labels: accLabels,
              datasets: [
                {
                  label: 'Attempts',
                  data: actValues,
                  backgroundColor: '#A5B4FC',
                  borderRadius: 6,
                },
              ],
            }}
          />
        </div>

        {/* Difficult signs */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Difficult Signs</h3>
          {summary.difficult_signs.length ? (
            <div className="space-y-3">
              {summary.difficult_signs.map((s) => (
                <div key={s.sign} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold flex-1">{s.sign}</span>
                  <span className="text-xs opacity-60">{s.attempts} attempts</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.accuracy < 50 ? 'bg-coral/20 text-coral' : 'bg-white/10 opacity-80'}`}>
                    {s.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-50">Practise a sign at least twice to see difficulty here.</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
        {summary.recent_activity.length ? (
          <div className="space-y-2">
            {summary.recent_activity.map((r, i) => (
              <div key={`${r.timestamp}-${i}`} className="flex items-center gap-3 text-sm border-b border-white/5 py-2 last:border-0">
                <span className={r.result === 'correct' ? 'text-teal-light' : r.result === 'unclear' ? 'text-coral' : 'text-indigoAccent-light'}>
                  {r.result === 'correct' ? <FiCheckCircle /> : r.result === 'unclear' ? <FiAlertCircle /> : <FiXCircle />}
                </span>
                <span className="font-semibold w-24 truncate">{r.target}</span>
                <span className="opacity-70 text-xs flex-1">
                  detected {r.detected || '—'} · {r.confidence > 0 ? `${Math.round(r.confidence * 100)}%` : 'conf. n/a'}
                </span>
                <span className="opacity-50 text-xs">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-50">No recent practice recorded.</p>
        )}
      </div>
    </div>
  )
}