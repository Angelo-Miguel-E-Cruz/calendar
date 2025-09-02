import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/supabase-server'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

type RouteContext = { params: { id: string; eventId: string } }

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
    const { data: membership } = await supabase
      .from('calendar_members')
      .select('id')
      .eq('calendar_id', calendarId)
      .eq('user_id', userId)
      .single()

    if (!membership) {
      return { resultStatus: false, resultMsg: calendarId, errorStatus: 403 }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await findUser(userId)
    if (!result.resultStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: result.errorStatus })
    }

    const internalUserId = result.findSuccess!.data.id
    const { start_time, end_time } = await request.json()

    // Await the params since they're now a Promise
    const resolvedParams = await params

    // Verify user has access to this calendar
    const props: VerifyParams = {
      calendarId: resolvedParams.id,
      userId: internalUserId
    }

    const { resultStatus, resultMsg, errorStatus } = await verifyUser(props)

    if (!resultStatus) {
      return NextResponse.json({ error: resultMsg }, { status: errorStatus })
    }

    const { error, count } = await supabase
      .from('events')
      .update({ start_time: start_time, end_time: end_time })
      .eq('id', resolvedParams.eventId)

    if (error) throw error

    if (count === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ message: "Updated successfully" }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await findUser(userId)
    if (!result.resultStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: result.errorStatus })
    }

    const internalUserId = result.findSuccess!.data.id

    // Await the params since they're now a Promise
    const resolvedParams = await params

    // Verify user has access to this calendar
    const props: VerifyParams = {
      calendarId: resolvedParams.id,
      userId: internalUserId
    }

    const { resultStatus, resultMsg, errorStatus } = await verifyUser(props)

    if (!resultStatus) {
      return NextResponse.json({ error: resultMsg }, { status: errorStatus })
    }

    const { error, count } = await supabase
      .from('events')
      .delete({ count: 'exact' })
      .eq('id', resolvedParams.eventId)

    if (error) throw error

    if (count === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}