/**
 * Site-wide background ambiance — three large, softly blurred drifting
 * orbs (coral / violet / green) rendered ONCE in the root layout.
 * Every page shares the same backdrop without duplicating the effect.
 */
export default function BackgroundOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="orb orb-coral orb-pos-tl" />
      <div className="orb orb-violet orb-pos-tr" />
      <div className="orb orb-green orb-pos-b" />
    </div>
  )
}