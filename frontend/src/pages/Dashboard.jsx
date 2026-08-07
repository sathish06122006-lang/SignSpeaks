import { useEffect, useState } from 'react'
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
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

const chartTextColor = '#CBD5E1'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/dashboard/summary')
      .then(({ data }) => setSummary(data))
      .catch(() =>
        setSummary({
          total_signs_detected: 0,
          accuracy_percent: 0,
          practice_time_minutes: 0,
          weekly_progress: [],
          category_breakdown: [],
        })
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const weeklyLabels = summary.weekly_progress.map((d) => d.date)
  const weeklyCounts = summary.weekly_progress.map((d) => d.count)

  const categoryLabels = summary.category_breakdown.map((c) => c.category)
  const categoryCounts = summary.category_breakdown.map((c) => c.count)

  const commonOptions = {
    plugins: { legend: { labels: { color: chartTextColor } } },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: chartTextColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
      <p className="opacity-70 mb-8">Your learning progress at a glance.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Signs Detected" value={summary.total_signs_detected} />
        <StatCard label="Accuracy" value={`${summary.accuracy_percent}%`} />
        <StatCard label="Practice Time" value={`${summary.practice_time_minutes} min`} />
        <StatCard label="Daily Progress" value={weeklyCounts.at(-1) ?? 0} sub="signs today" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
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
                    borderColor: '#5EEAD4',
                    backgroundColor: 'rgba(94,234,212,0.2)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
            />
          ) : (
            <p className="opacity-60 text-sm">Start practicing in Live Detection to see your progress here.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Sign Category Breakdown</h3>
          {categoryLabels.length ? (
            <Pie
              data={{
                labels: categoryLabels,
                datasets: [
                  {
                    data: categoryCounts,
                    backgroundColor: ['#14B8A6', '#6366F1', '#FB7185', '#FBBF24'],
                  },
                ],
              }}
              options={{ plugins: { legend: { labels: { color: chartTextColor } } } }}
            />
          ) : (
            <p className="opacity-60 text-sm">No category data yet.</p>
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
                    backgroundColor: '#A5B4FC',
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
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wide opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-display font-bold text-gradient">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  )
}
