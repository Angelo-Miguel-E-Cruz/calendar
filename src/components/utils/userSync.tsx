'use client'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useClerkSupabase } from '@/lib/supabase/client'

export function UserSync() {
  const { user, isLoaded } = useUser()
  const supabase = useClerkSupabase()

  useEffect(() => {
    console.log('UserSync effect running:', { isLoaded, hasUser: !!user })

    if (!isLoaded) {
      console.log('Clerk not loaded yet...')
      return
    }

    if (!user) {
      console.log('No user found')
      return
    }

    const syncUser = async () => {
      try {

        // Check if user exists in Supabase
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking for existing user:', checkError)
          return
        }

        if (!existingUser) {

          const userData = {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            avatar_url: user.imageUrl || null,
          }

          // Create user in Supabase
          const { error: insertError, data: insertData } = await supabase
            .from('users')
            .insert(userData)
            .select()

          if (insertError) {
            console.error('Error creating user:', insertError)
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    }

    syncUser()
  }, [user, isLoaded, supabase])

  return null
}
