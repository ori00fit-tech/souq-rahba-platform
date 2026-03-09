create table if not exists users (
  id text primary key,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'buyer',
  locale text not null default 'ar',
  password_hash text,
  created_at text not null default current_timestamp
);

create table if not exists sessions (
  id text primary key,
  user_id text not null,
  token text not null unique,
  created_at text not null default current_timestamp,
  expires_at text,
  foreign key (user_id) references users(id)
);

create table if not exists sellers (
  id text primary key,
  owner_user_id text not null,
  slug text not null unique,
  display_name text not null,
  city text,
  verified integer not null default 0,
  kyc_status text not null default 'pending',
  rating real not null default 0,
  created_at text not null default current_timestamp,
  foreign key (owner_user_id) references users(id)
);

create table if not exists categories (
  id text primary key,
  slug text not null unique,
  name_ar text not null,
  name_fr text,
  name_en text,
  parent_id text,
  foreign key (parent_id) references categories(id)
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
  product_kind text not null default 'physical',
  condition_label text not null default 'new',
  sku text,
  brand text,
  price_mad integer not null,
  compare_at_mad integer,
  stock integer not null default 0,
  weight_kg real,
  shipping_class text,
  status text not null default 'draft',
  created_at text not null default current_timestamp,
  foreign key (seller_id) references sellers(id),
  foreign key (category_id) references categories(id)
);

create table if not exists product_media (
  id text primary key,
  product_id text not null,
  media_type text not null default 'image',
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  foreign key (product_id) references products(id)
);

create table if not exists orders (
  id text primary key,
  buyer_user_id text,
  seller_id text,
  order_status text not null,
  payment_method text not null,
  payment_status text not null,
  shipping_status text not null default 'pending',
  total_mad integer not null,
  currency text not null default 'MAD',
  created_at text not null default current_timestamp,
  foreign key (buyer_user_id) references users(id),
  foreign key (seller_id) references sellers(id)
);

create table if not exists order_items (
  id text primary key,
  order_id text not null,
  product_id text not null,
  quantity integer not null,
  unit_price_mad integer not null,
  foreign key (order_id) references orders(id),
  foreign key (product_id) references products(id)
);
