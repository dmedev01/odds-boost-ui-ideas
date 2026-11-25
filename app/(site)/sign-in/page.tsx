import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Log in' }

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect('/')
  return <AuthForm mode="sign-in" />
}
