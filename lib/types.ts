export type OrderStatus =
  | "pending"
  | "accepted"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  rider_id: string | null;
  status: OrderStatus;
  total: number;
  delivery_address: string;
  delivery_notes: string | null;
  customer_phone: string | null;
  placed_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
};

export type Message = {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type OwnerStats = {
  range: { from: string; to: string };
  kpis: {
    total_orders: number;
    delivered: number;
    cancelled: number;
    active: number;
    revenue: number;
    avg_delivery_seconds: number | null;
  } | null;
  orders_per_day: { day: string; orders: number; revenue: number }[];
  revenue_per_day: { day: string; revenue: number }[];
  status_breakdown: { status: OrderStatus; count: number }[];
  top_items: { item_name: string; qty: number }[];
  deliveries_per_rider: {
    rider_id: string;
    full_name: string;
    deliveries: number;
  }[];
};
