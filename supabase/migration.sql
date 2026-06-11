-- ================================================================
-- Nitipcatip Supabase Migration
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_pemesan TEXT NOT NULL,
  whatsapp TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  kota_tujuan TEXT NOT NULL,
  kode_pos TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  nama_pemesan TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  kota_tujuan TEXT NOT NULL,
  kode_pos TEXT NOT NULL,
  total_harga_barang BIGINT DEFAULT 0,
  total_fee_jastip BIGINT DEFAULT 0,
  total_pembayaran BIGINT DEFAULT 0,
  ongkir BIGINT DEFAULT 0,
  shipping_method TEXT,
  shipping_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'qris',
  status TEXT DEFAULT 'pending',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  nama_barang TEXT NOT NULL,
  link_produk TEXT,
  ukuran_varian TEXT,
  warna TEXT,
  jumlah INTEGER NOT NULL DEFAULT 1,
  harga_barang BIGINT NOT NULL DEFAULT 0,
  size_order TEXT NOT NULL DEFAULT 'small',
  fee_jastip BIGINT DEFAULT 0,
  subtotal BIGINT DEFAULT 0,
  lampiran_url TEXT,
  lampiran_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_whatsapp ON orders(whatsapp);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read/write (no auth, lookup by phone/email)
-- Customers: anyone can insert, read own by phone
CREATE POLICY "Allow insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow update customers" ON customers FOR UPDATE USING (true);

-- Orders: anyone can insert and select
CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true);

-- Order items: anyone can insert and select
CREATE POLICY "Allow insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select order_items" ON order_items FOR SELECT USING (true);
