import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderDetails, cartItems, total } = body;

    // 1. Create order record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          customer_name: orderDetails.name,
          phone: orderDetails.phone,
          address: orderDetails.address,
          status: 'Pending'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items records
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
