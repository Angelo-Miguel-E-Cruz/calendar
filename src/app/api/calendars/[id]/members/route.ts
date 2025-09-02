import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/supabase-server'

const supabase = createAdminClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const body: { email: string } = await request.json()
    const { email } = body

    const resolvedParams = await params

    // Check if user has permission to invite (owner or admin)
    const { data: membership } = await supabase
      .from('calendar_members')
      .select('role')
      .eq('calendar_id', resolvedParams.id)
      .eq('user_id', internalUserId)
      .single()


    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Find user by email
    const { data: invitedUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !invitedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Add to calendar_members
    const { error } = await supabase
      .from('calendar_members')
      .insert({
        calendar_id: resolvedParams.id,
        user_id: invitedUser.id,
        role: 'member' as const
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}