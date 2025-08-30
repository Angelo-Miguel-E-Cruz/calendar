import { createAdminClient } from '@/lib/supabase/supabase-server'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createAdminClient()

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userQuery = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userQuery.error) {
      const err = userQuery.error
      return NextResponse.json({ err }, { status: userQuery.status })
    }
    if (!userQuery.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const internalUserId = userQuery.data.id

    const { data, error, status } = await supabase
      .from('calendars')
      .select(`
        *,
        calendar_members!inner(role)
      `)
      .eq('calendar_members.user_id', internalUserId)

    if (error) throw error

    return NextResponse.json({ calendars: data }, { status: status })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    const userQuery = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userQuery.error) {
      const err = userQuery.error
      return NextResponse.json({ err }, { status: 400 })
    }
    if (!userQuery.data) {
      return NextResponse.json({ error: 'User not found', user: { userId }, query: { userQuery } }, { status: 404 })
    }

    const internalUserId = userQuery.data.id

    // Create calendar
    const { data: calendar, error } = await supabase
      .from('calendars')
      .insert({ name, description, owner_id: internalUserId })
      .select()
      .single()

    if (error) throw error

    // Add owner as member
    const { error: ownerErr } = await supabase
      .from('calendar_members')
      .insert({ calendar_id: calendar.id, user_id: internalUserId, role: 'owner' })

    if (ownerErr) throw ownerErr

    return NextResponse.json({ calendar })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 400 })
  }
}