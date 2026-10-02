export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-brandGreen/30 border-t-brandGreen animate-spin" />
      <p className="text-sm opacity-70">{label}</p>
    </div>
  )
}
