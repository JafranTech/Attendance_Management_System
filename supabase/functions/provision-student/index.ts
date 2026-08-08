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
    // Admin client — uses SERVICE ROLE key (only available server-side in Edge Functions)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await req.json()
    const { action, students } = body
    // students = array of { roll_number, name, student_id }
    // action = 'provision' | 'deactivate' | 'backfill'

    if (!action || !students || !Array.isArray(students)) {
      return new Response(JSON.stringify({ error: 'Missing action or students array' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const results = []

    for (const student of students) {
      const { roll_number, name, student_id } = student
      const email = `${roll_number}@crescent.education`

      try {
        if (action === 'provision' || action === 'backfill') {
          // Check if an auth user already exists with this email
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
          const existingUser = existingUsers?.users?.find(u => u.email === email)

          let authUserId

          if (existingUser) {
            // User already exists — unban if banned, return their id
            if (existingUser.banned_until) {
              await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                ban_duration: 'none'
              })
            }
            authUserId = existingUser.id
          } else {
            // Create brand new auth account
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password: 'crescent1234',
              email_confirm: true,
              user_metadata: {
                role: 'student',
                name: name,
                roll_number: roll_number,
              }
            })

            if (createError) {
              results.push({ roll_number, success: false, error: createError.message })
              continue
            }
            authUserId = newUser.user.id
          }

          // Link auth_user_id back to the students table
          if (student_id) {
            await supabaseAdmin
              .from('students')
              .update({ auth_user_id: authUserId })
              .eq('id', student_id)
          }

          results.push({ roll_number, success: true, auth_user_id: authUserId })

        } else if (action === 'deactivate') {
          // Find auth user by email and ban them
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
          const existingUser = existingUsers?.users?.find(u => u.email === email)

          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              ban_duration: '876600h' // 100 years = effectively permanent
            })
            results.push({ roll_number, success: true, action: 'banned' })
          } else {
            results.push({ roll_number, success: true, action: 'not_found' })
          }
        }

      } catch (err) {
        results.push({ roll_number, success: false, error: err.message })
      }
    }

    return new Response(JSON.stringify({ results }), {
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
