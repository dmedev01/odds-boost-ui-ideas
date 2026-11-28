'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

const field =
  'h-11 w-full rounded-lg bg-surface-2 px-3 text-sm font-semibold outline-none ring-1 ring-border placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const signUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    if (signUp && !form.get('age')) {
      setError('You must confirm you are 18 or older.')
      return
    }

    setPending(true)
    setError(null)
    const { error } = signUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setPending(false)

    if (error) {
      setError(signUp ? 'Could not create your account. Please check your details.' : 'Invalid email or password.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-xl bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">{signUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="text-sm text-muted-foreground">
          {signUp ? 'Get 10 000 FCFA demo credit to try every product.' : 'Log in to bet, play and track your tickets.'}
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {signUp && (
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Full name
            <input name="name" required autoComplete="name" className={field} placeholder="Jean Mbarga" />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={signUp ? 'new-password' : 'current-password'}
            className={field}
            placeholder="At least 8 characters"
          />
        </label>
        {signUp && (
          <label className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-muted-foreground">
            <input name="age" type="checkbox" className="mt-0.5 size-4 accent-primary" />
            I confirm I am 21 or older and accept the terms and responsible gaming policy.
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm font-bold text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 font-extrabold" disabled={pending}>
          {pending ? 'Please wait…' : signUp ? 'Create account' : 'Log in'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {signUp ? 'Already have an account? ' : 'New here? '}
        <Link href={signUp ? '/sign-in' : '/sign-up'} className="font-bold text-primary">
          {signUp ? 'Log in' : 'Join now'}
        </Link>
      </p>
    </div>
  )
}
