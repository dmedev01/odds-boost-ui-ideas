import type { Metadata } from 'next'
import { TicketChecker } from '@/components/ticket/ticket-checker'
import { getT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT()
  return { title: t('ticket.title'), description: t('ticket.intro') }
}

export default async function TicketPage() {
  const { t } = await getT()
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-black">{t('ticket.title')}</h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{t('ticket.intro')}</p>
      </header>
      <TicketChecker />
    </div>
  )
}
