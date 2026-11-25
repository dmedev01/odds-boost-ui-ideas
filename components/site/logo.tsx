import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 text-xl font-black italic tracking-tight" aria-label="WandaBet home">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-base not-italic">W</span>
      <span>
        wanda<span className="text-primary">bet</span>
      </span>
    </Link>
  )
}
