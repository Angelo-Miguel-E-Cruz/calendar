import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/supabase-server'
import { CalendarWithMembers } from '@/lib/exports'

interface RouteParams {
  params: {
    id: string
  }
}

const supabase = createAdminClient()

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
      (member) => member.user_id === params.id
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await supabase
      .from('calendars')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: "Deleted succesfully" }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}