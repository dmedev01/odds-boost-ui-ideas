import type { SVGProps } from 'react'

export function HorseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 21v-5l-2-3 3-6 4-2 2-3 1 3 4 1 4 4-2 2-3-1-2 2v8" />
      <path d="M10 13l-2 8" />
      <circle cx="13.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}
