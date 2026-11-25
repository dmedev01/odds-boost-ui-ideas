import { LiteImage } from '@/components/lite/lite-mode'

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  image?: string
  children?: React.ReactNode
}) {
  return (
    <header className="relative mb-4 overflow-hidden rounded-xl bg-brand">
      {image && (
        <LiteImage
          kb={350}
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover opacity-40"
        />
      )}
      <div className="relative flex flex-col gap-2 bg-gradient-to-r from-brand via-brand/90 to-transparent p-5 md:p-7">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="text-balance text-2xl font-black md:text-3xl">{title}</h1>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-foreground/80">{description}</p>
        {children}
      </div>
    </header>
  )
}
