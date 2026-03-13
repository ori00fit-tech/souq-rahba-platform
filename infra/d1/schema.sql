PRAGMA foreign_keys = ON;

create table if not exists users (
  id text primary key,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'buyer'
    check (role in ('buyer', 'seller', 'admin')),
  locale text not null default 'ar'
    check (locale in ('ar', 'fr', 'en')),
  password_hash text,
  is_active integer not null default 1
    check (is_active in (0, 1)),
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists sessions (
  id text primary key,
  user_id text not null,
  token text not null unique,
  created_at text not null default current_timestamp,
  expires_at text,
  revoked_at text,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists sellers (
  id text primary key,
  owner_user_id text not null,
  slug text not null unique,
  display_name text not null,
  description_ar text,
  description_fr text,
  description_en text,
  city text,
  logo_url text,
  banner_url text,
  verified integer not null default 0
    check (verified in (0, 1)),
  kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'approved', 'rejected')),
  rating real not null default 0
    check (rating >= 0 and rating <= 5),
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (owner_user_id) references users(id) on delete cascade
);

create table if not exists categories (
  id text primary key,
  slug text not null unique,
  name_ar text not null,
  name_fr text,
  name_en text,
  parent_id text,
  sort_order integer not null default 0,
  is_active integer not null default 1
    check (is_active in (0, 1)),
  foreign key (parent_id) references categories(id) on delete set null
);

create table if not exists products (
  id text primary key,
  seller_id text not null,
  slug text not null unique,
  title_ar text not null,
  title_fr text,
  title_en text,
  description_ar text,
  description_fr text,
  description_en text,
  category_id text,
  product_kind text not null default 'physical'
    check (product_kind in ('physical', 'digital', 'service')),
  condition_label text not null default 'new'
    check (condition_label in ('new', 'used', 'refurbished')),
  sku text,
  brand text,
  price_mad integer not null
    check (price_mad >= 0),
  compare_at_mad integer
    check (compare_at_mad is null or compare_at_mad >= price_mad),
  stock integer not null default 0
    check (stock >= 0),
  weight_kg real,
  shipping_class text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived', 'out_of_stock')),
  featured integer not null default 0
    check (featured in (0, 1)),
  published_at text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (seller_id) references sellers(id) on delete cascade,
  foreign key (category_id) references categories(id) on delete set null
);

create table if not exists product_media (
  id text primary key,
  product_id text not null,
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  file_key text,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary integer not null default 0
    check (is_primary in (0, 1)),
  foreign key (product_id) references products(id) on delete cascade
);

create table if not exists orders (
  id text primary key,
  buyer_user_id text,
  seller_id text,
  order_status text not null default 'pending'
    check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text not null
    check (payment_method in ('cash_on_delivery', 'card', 'bank_transfer')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_status text not null default 'pending'
    check (shipping_status in ('pending', 'packed', 'shipped', 'delivered', 'returned')),
  currency text not null default 'MAD',
  subtotal_mad integer not null default 0
    check (subtotal_mad >= 0),
  shipping_fee_mad integer not null default 0
    check (shipping_fee_mad >= 0),
  discount_mad integer not null default 0
    check (discount_mad >= 0),
  total_mad integer not null
    check (total_mad >= 0),

  customer_full_name text,
  customer_phone text,
  customer_city text,
  customer_address text,
  customer_notes text,
  shipping_method text,

  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,

  foreign key (buyer_user_id) references users(id) on delete set null,
  foreign key (seller_id) references sellers(id) on delete set null
);

create table if not exists order_items (
  id text primary key,
  order_id text not null,
  product_id text,
  seller_id text,
  product_title_snapshot text not null,
  sku_snapshot text,
  quantity integer not null
    check (quantity > 0),
  unit_price_mad integer not null
    check (unit_price_mad >= 0),
  line_total_mad integer not null
    check (line_total_mad >= 0),

  foreign key (order_id) references orders(id) on delete cascade,
  foreign key (product_id) references products(id) on delete set null,
  foreign key (seller_id) references sellers(id) on delete set null
);

create table if not exists order_events (
  id text primary key,
  order_id text not null,
  event_type text not null,
  payload_json text,
  created_at text not null default current_timestamp,
  foreign key (order_id) references orders(id) on delete cascade
);

create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_token on sessions(token);
create index if not exists idx_sessions_expires_at on sessions(expires_at);

create index if not exists idx_sellers_owner_user_id on sellers(owner_user_id);
create index if not exists idx_sellers_slug on sellers(slug);
create index if not exists idx_sellers_verified on sellers(verified, kyc_status);

create index if not exists idx_categories_parent_id on categories(parent_id);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_categories_sort_order on categories(sort_order);

create index if not exists idx_products_seller_id on products(seller_id);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_featured on products(featured, status);
create index if not exists idx_products_created_at on products(created_at);
create index if not exists idx_products_published_at on products(published_at);

create index if not exists idx_product_media_product_id on product_media(product_id);
create index if not exists idx_product_media_primary on product_media(product_id, is_primary, sort_order);

create index if not exists idx_orders_buyer_user_id on orders(buyer_user_id);
create index if not exists idx_orders_seller_id on orders(seller_id);
create index if not exists idx_orders_order_status on orders(order_status);
create index if not exists idx_orders_created_at on orders(created_at);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

create index if not exists idx_order_events_order_id on order_events(order_id);
create index if not exists idx_order_events_created_at on order_events(created_at);
