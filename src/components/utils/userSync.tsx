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

    console.log('User found:', {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    })

    const syncUser = async () => {
      try {
        console.log('Checking if user exists in Supabase...')

        // Check if user exists in Supabase
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single()

        console.log('Check result:', { existingUser, checkError })

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking for existing user:', checkError)
          return
        }

        if (!existingUser) {
          console.log('User not found, creating new user...')

          const userData = {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            avatar_url: user.imageUrl || null,
          }

          console.log('Inserting user data:', userData)

          // Create user in Supabase
          const { error: insertError, data: insertData } = await supabase
            .from('users')
            .insert(userData)
            .select()

          if (insertError) {
            console.error('Error creating user:', insertError)
          } else {
            console.log('User synced to Supabase!', insertData)
          }
        } else {
          console.log('User already exists in Supabase')
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    }

    syncUser()
  }, [user, isLoaded, supabase])

  return null
}
