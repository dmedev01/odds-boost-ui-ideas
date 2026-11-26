import type { SVGProps } from 'react'

export function BoltIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M15 0.5 3.5 13.5H11L9 23.5 20.5 10.5H13L15 0.5Z" strokeLinejoin="miter" />
    </svg>
  )
}
