import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhbiagnhjzkkxfcyqpct.supabase.co'
const supabaseKey = 'sb_publishable_d-p-zfFB4DVzyIwDiN_3sg_no6kCMIq'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  // Test with new password (no period)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'staff123@gmail.com',
    password: 'staff123'
  })
  
  if (error) {
    console.error("Auth Error:", error.message, error.status)
  } else {
    console.log("Auth Success:", data.user?.email)
  }
}

testAuth()
