// Order fees (NGN). These MUST match the constants inside the place_order
// RPC (supabase/migrations/0011_order_fees.sql), which is the source of truth
// for what the customer is actually charged. The client uses them only to show
// the breakdown before placing the order.
export const PACK_FEE = 200; // flat packaging fee per order
export const DELIVERY_FEE = 500; // flat delivery fee per order
