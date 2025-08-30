import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/supabase-server'
import { CalendarWithMembers } from '@/lib/exports'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('calendars')
      .select(`
        *,
        calendar_members(user_id, role, users(email, first_name, last_name))
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    const calendar = data as CalendarWithMembers

    // Check if user has access
    const hasAccess = calendar.calendar_members.some(
      (member) => member.user_id === userId
    )

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ calendar })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}