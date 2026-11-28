import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BetHistory } from '@/components/account/bet-history'
import { BackButton } from '@/components/site/back-button'
import { getUserId } from '@/lib/session'
import { listBets } from '@/lib/wallet'

export const metadata: Metadata = { title: 'My bets' }

export default async function MyBetsPage() {
  const userId = await getUserId()
  if (!userId) redirect('/sign-in')
  const bets = await listBets(userId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <BackButton fallback="/account" />
        <h1 className="text-2xl font-black">My bets</h1>
      </div>
      <BetHistory bets={bets} />
    </div>
  )
}
