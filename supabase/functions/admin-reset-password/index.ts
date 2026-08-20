import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Admin client — uses SERVICE ROLE key (server-side only)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Caller client — used to verify the requester is an admin
    const callerToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!callerToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the caller's identity using their JWT
    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken)
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check that caller is an admin in the faculty table
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('faculty')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (profileError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Only admins can reset passwords' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const { target_user_id, new_password, roll_number, student_id, name } = body

    if (!new_password || (!target_user_id && !roll_number)) {
      return new Response(JSON.stringify({ error: 'Missing target_user_id/roll_number or new_password' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let authUserId = target_user_id

    // If target_user_id is not provided or if roll_number is provided (student account reset/provision)
    if (!authUserId && roll_number) {
      const email = `${roll_number}@crescent.education`
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)

      if (existingUser) {
        authUserId = existingUser.id
      } else {
        // Create student auth account
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: new_password,
          email_confirm: true,
          user_metadata: {
            role: 'student',
            name: name || roll_number,
            roll_number: roll_number,
          }
        })
        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        authUserId = newUser.user.id
      }
    }

    // Reset password using service role
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { password: new_password }
    )

    if (resetError) {
      return new Response(JSON.stringify({ error: resetError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Link back to students table if student_id is provided
    if (student_id && authUserId) {
      await supabaseAdmin
        .from('students')
        .update({ auth_user_id: authUserId })
        .eq('id', student_id)
    }

    return new Response(JSON.stringify({ success: true, message: 'Password reset successfully.', auth_user_id: authUserId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
