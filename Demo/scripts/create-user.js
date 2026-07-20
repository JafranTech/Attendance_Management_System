// Run with: node scripts/create-user.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://dhbiagnhjzkkxfcyqpct.supabase.co',
  'sb_secret_xkz-recQsePp8yTT_uFdkQ_OvIJvBj7'
)

async function main() {
  // First delete the broken SQL-created user
  const { data: users } = await supabase.auth.admin.listUsers()
  const existing = users?.users?.find(u => u.email === 'staff123@gmail.com')
  
  if (existing) {
    console.log('Deleting existing user:', existing.id)
    const { error: delErr } = await supabase.auth.admin.deleteUser(existing.id)
    if (delErr) console.error('Delete error:', delErr.message)
    else console.log('Deleted.')
  }

  // Recreate properly via admin API
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'staff123@gmail.com',
    password: 'staff123.',
    email_confirm: true,
  })

  if (error) {
    console.error('Create error:', error.message)
  } else {
    console.log('User created successfully:', data.user.email, data.user.id)
  }
}

main()
