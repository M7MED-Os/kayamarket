import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddkijudzqayvyxnobojg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka2lqdWR6cWF5dnl4bm9ib2pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzNDIwNSwiZXhwIjoyMDkyODEwMjA1fQ.IvIkBjoQ770aEX8ns7kKdXDhEOeFzMZCTUoa0RCvAu4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fix() {
  const { data, error } = await supabase
    .from('products')
    .update({ category: 'الكل' })
    .eq('category', 'عام')
    .select()

  console.log('Update result:', data?.length, 'rows updated. Error:', error)
}
fix()
