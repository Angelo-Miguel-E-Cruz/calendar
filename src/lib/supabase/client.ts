"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function useClerkSupabase() {
  const { getToken } = useAuth()
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    const setupClient = async () => {
      const token = await getToken({ template: 'supabase' })

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          },
          auth: {
            persistSession: false,
          },
        }
      )

      setClient(supabase)
    }

    setupClient()
  }, [getToken])

  return client
}