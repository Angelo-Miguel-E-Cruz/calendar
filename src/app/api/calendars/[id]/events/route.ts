import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/supabase-server'
import { DatabaseEvent } from '@/lib/exports'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

interface RouteParams {
  params: {
    id: string
  }
}

interface VerifyParams {
  calendarId: string,
  userId: string
}

interface ResultParams {
  resultStatus: boolean,
  resultMsg?: string,
  errorStatus?: number,
  findSuccess?: PostgrestSingleResponse<any>
}

const supabase = createAdminClient()

async function verifyUser({ calendarId, userId }: VerifyParams): Promise<ResultParams> {
  try {
    // Verify user has access to this calendar
    const { data: membership } = await supabase
      .from('calendar_members')
      .select('id')
      .eq('calendar_id', calendarId)
      .eq('user_id', userId)
      .single()

    if (!membership) {
      return { resultStatus: false, resultMsg: 'Forbidden', errorStatus: 403 }
    }
    return { resultStatus: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { resultStatus: false, resultMsg: errorMessage, errorStatus: 400 }
  }
}

async function findUser(userId: string): Promise<ResultParams> {
  try {
    const userQuery = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userQuery.error) {
      const err: unknown = userQuery.error
      return { resultStatus: false, resultMsg: err as string, errorStatus: userQuery.status }
    }
    if (!userQuery.data) {
      return { resultStatus: false, resultMsg: 'User not found', errorStatus: 404 }
    }
    return { resultStatus: true, findSuccess: userQuery }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { resultStatus: false, resultMsg: errorMessage, errorStatus: 400 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = findUser(userId)
    const { findSuccess: userQuery } = await result
    const internalUserId = userQuery!.data.id

    // Verify user has access to this 
    const props: VerifyParams = {
      calendarId: params.id,
      userId: internalUserId
    }
    const { resultStatus, resultMsg, errorStatus } = await verifyUser(props)
    if (!resultStatus) {
      return NextResponse.json({ error: resultMsg }, { status: errorStatus })
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

    const result = findUser(userId)
    const { findSuccess: userQuery } = await result
    const internalUserId = userQuery!.data.id

    const body: {
      title: string
      description?: string
      start_time: string
      end_time?: string
      allDay: boolean
    } = await request.json()

    const { title, description, start_time, end_time, allDay } = body

    // Verify user has access to this calendar
    const props: VerifyParams = {
      calendarId: params.id,
      userId: internalUserId
    }
    const { resultStatus, resultMsg, errorStatus } = await verifyUser(props)
    if (!resultStatus) {
      return NextResponse.json({ error: resultMsg }, { status: errorStatus })
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        calendar_id: params.id,
        title,
        description,
        start_time,
        end_time,
        allDay,
        created_by: internalUserId
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: event as DatabaseEvent, req: body })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 })
  }
}