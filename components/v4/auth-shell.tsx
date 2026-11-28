export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-xl bg-surface p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-black">{title}</h1>
        {description && <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}
