import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/supabase-server'
import { DatabaseEvent } from '@/lib/exports'

interface RouteParams {
  params: {
    id: string
  }
}

const supabase = createAdminClient()

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
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

    // Verify user has access to this calendar
    const { data: membership } = await supabase
      .from('calendar_members')
      .select('id')
      .eq('calendar_id', params.id)
      .eq('user_id', internalUserId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('calendar_id', params.id)
      .order('start_time', { ascending: true })

    if (error) throw error

    return NextResponse.json({ events: events as DatabaseEvent[] })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
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

    const body: {
      title: string
      description?: string
      start_time: string
      end_time: string
    } = await request.json()

    const { title, description, start_time, end_time } = body

    // Verify user has access to this calendar
    const { data: membership } = await supabase
      .from('calendar_members')
      .select('id')
      .eq('calendar_id', params.id)
      .eq('user_id', internalUserId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        calendar_id: params.id,
        title,
        description,
        start_time,
        end_time,
        created_by: internalUserId
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: event as DatabaseEvent })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}