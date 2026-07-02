import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xhsnvvvahswctjkytuzh.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Nzbt-tyxpzWgSek9MZGDzQ_LOAJHIsA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing Supabase insert...");
  const { data, error } = await supabase.from('orders').insert({
    order_id: "TEST-123",
    fullname: "Test User",
    phone: "123456789",
    wilaya: "Test",
    commune: "Test",
    address: "Test",
    product_name: "Test",
    variant_title: "Test",
    total_amount: 1000,
    delivery_type: "Test",
    delivery_fee: 0,
    status: "pending"
  }).select();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert success:", data);
  }
}

testInsert();
