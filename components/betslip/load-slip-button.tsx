'use client'

import { useState } from 'react'
import { Check, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n/i18n-provider'
import { useBetSlip } from './betslip-provider'

export function LoadSlipButton({ keys }: { keys: string[] }) {
  const { load } = useBetSlip()
  const { t } = useI18n()
  const [loaded, setLoaded] = useState(false)

  return (
    <Button
      size="lg"
      className="h-12 w-full text-base font-extrabold"
      onClick={() => {
        load(keys)
        setLoaded(true)
      }}
    >
      {loaded ? <Check className="size-5" aria-hidden="true" /> : <Ticket className="size-5" aria-hidden="true" />}
      {loaded ? t('shared.added') : t('shared.add')}
    </Button>
  )
}
