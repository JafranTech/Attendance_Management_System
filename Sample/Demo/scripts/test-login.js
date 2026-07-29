// Test login works
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://dhbiagnhjzkkxfcyqpct.supabase.co',
  'sb_publishable_d-p-zfFB4DVzyIwDiN_3sg_no6kCMIq'
)

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'staff123@gmail.com',
    password: 'staff123.',
  })

  if (error) {
    console.error('Login FAILED:', error.message)
  } else {
    console.log('Login SUCCESS! Token starts with:', data.session?.access_token?.substring(0, 30))
  }
}

main()
