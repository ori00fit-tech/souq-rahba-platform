delete from order_events;
delete from order_items;
delete from orders;
delete from product_media;
delete from products;
delete from categories;
delete from sellers;
delete from sessions;
delete from users;

insert into users (
  id, email, full_name, phone, role, locale, password_hash, is_active
) values
('u_admin', 'admin@rahba.test', 'Rahba Admin', '0600000099', 'admin', 'ar', 'demo_admin_hash', 1),
('u1', 'seller1@rahba.test', 'Seller One', '0600000001', 'seller', 'ar', 'demo_seller1_hash', 1),
('u2', 'seller2@rahba.test', 'Seller Two', '0600000002', 'seller', 'ar', 'demo_seller2_hash', 1),
('u3', 'buyer1@rahba.test', 'Buyer One', '0600000003', 'buyer', 'ar', 'demo_buyer1_hash', 1),
('u4', 'buyer2@rahba.test', 'Buyer Two', '0600000010', 'buyer', 'ar', 'demo_buyer2_hash', 1);

insert into sellers (
  id, owner_user_id, slug, display_name,
  description_ar, description_fr, description_en,
  city, logo_url, banner_url, verified, kyc_status, rating
) values
(
  's1', 'u1', 'atlas-store', 'متجر أطلس',
  'متجر إلكترونيات وأدوات موثوق يقدم منتجات مختارة بجودة عالية.',
  'Boutique fiable pour électronique et outils.',
  'Trusted store for electronics and tools.',
  'الدار البيضاء',
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop',
  1, 'approved', 4.8
),
(
  's2', 'u2', 'casa-market', 'كازا ماركت',
  'متجر متخصص في مستلزمات المنزل والديكور والمنتجات اليومية.',
  'Boutique spécialisée en maison et décoration.',
  'Home and decor marketplace store.',
  'الرباط',
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
  1, 'approved', 4.6
),
(
  's3', 'u1', 'rahba-tools', 'رحبة للأدوات',
  'معدات وأدوات عملية للورش والأعمال والاحتياجات اليومية.',
  'Outils et équipements pratiques.',
  'Practical tools and workshop equipment.',
  'طنجة',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
  0, 'pending', 0
);

insert into categories (
  id, slug, name_ar, name_fr, name_en, parent_id, sort_order, is_active
) values
('c1', 'electronics', 'الإلكترونيات', 'Électronique', 'Electronics', null, 1, 1),
('c2', 'fashion', 'الأزياء', 'Mode', 'Fashion', null, 2, 1),
('c3', 'home', 'المنزل', 'Maison', 'Home', null, 3, 1),
('c4', 'beauty', 'الجمال', 'Beauté', 'Beauty', null, 4, 1),
('c5', 'sports', 'الرياضة', 'Sport', 'Sports', null, 5, 1),
('c6', 'tools', 'الأدوات', 'Outils', 'Tools', null, 6, 1),
('c7', 'automotive', 'السيارات', 'Automobile', 'Automotive', null, 7, 1),
('c8', 'garden', 'الحديقة', 'Jardin', 'Garden', null, 8, 1),
('c9', 'smartphones', 'الهواتف الذكية', 'Smartphones', 'Smartphones', 'c1', 1, 1),
('c10', 'lighting', 'الإنارة', 'Éclairage', 'Lighting', 'c3', 2, 1);

insert into products (
  id, seller_id, slug,
  title_ar, title_fr, title_en,
  description_ar, description_fr, description_en,
  category_id, product_kind, condition_label, sku, brand,
  price_mad, compare_at_mad, stock, weight_kg, shipping_class,
  status, featured, published_at
) values
(
  'p1', 's1', 'samsung-galaxy-a55',
  'هاتف Samsung Galaxy A55', 'Samsung Galaxy A55', 'Samsung Galaxy A55',
  'هاتف ذكي بشاشة مميزة وأداء قوي وكاميرا عالية الجودة.',
  'Smartphone performant avec bel écran.',
  'Powerful smartphone with vibrant display.',
  'c9', 'physical', 'new', 'SGA55-001', 'Samsung',
  3499, 3799, 18, 0.3, 'standard',
  'active', 1, current_timestamp
),
(
  'p2', 's2', 'modern-floor-lamp',
  'مصباح أرضي عصري', 'Lampe moderne', 'Modern Floor Lamp',
  'مصباح أنيق لغرفة الجلوس أو المكتب بتصميم عصري.',
  'Lampe élégante pour salon ou bureau.',
  'Elegant lamp for living room or office.',
  'c10', 'physical', 'new', 'LAMP-002', 'CasaLight',
  349, 449, 25, 2.2, 'bulky',
  'active', 1, current_timestamp
),
(
  'p3', 's3', 'cordless-power-drill',
  'مثقاب كهربائي لاسلكي', 'Perceuse sans fil', 'Cordless Power Drill',
  'مثقاب عملي للأعمال اليومية والورش المنزلية.',
  'Perceuse pratique pour atelier.',
  'Practical drill for home workshop.',
  'c6', 'physical', 'new', 'DRILL-003', 'Rahba Tools',
  649, 749, 14, 1.6, 'standard',
  'active', 1, current_timestamp
),
(
  'p4', 's2', 'running-shoes-pro',
  'حذاء رياضي احترافي', 'Chaussures de running', 'Running Shoes Pro',
  'حذاء خفيف ومريح للجري والتمارين.',
  'Chaussures confortables pour running.',
  'Lightweight running shoes.',
  'c5', 'physical', 'new', 'RUN-004', 'Move Sports',
  799, 899, 30, 0.8, 'standard',
  'active', 0, current_timestamp
),
(
  'p5', 's1', 'wireless-earbuds-pro',
  'سماعات لاسلكية برو', 'Écouteurs sans fil', 'Wireless Earbuds Pro',
  'سماعات بجودة صوت عالية وبطارية تدوم طويلًا.',
  'Écouteurs avec son premium.',
  'Premium earbuds with long battery life.',
  'c1', 'physical', 'new', 'EAR-005', 'Atlas Audio',
  499, 599, 40, 0.2, 'standard',
  'active', 1, current_timestamp
);

insert into product_media (
  id, product_id, media_type, file_key, url, alt_text, sort_order, is_primary
) values
(
  'pm1', 'p1', 'image', null,
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop',
  'Samsung Galaxy A55', 0, 1
),
(
  'pm2', 'p2', 'image', null,
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
  'مصباح أرضي عصري', 0, 1
),
(
  'pm3', 'p3', 'image', null,
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop',
  'مثقاب كهربائي لاسلكي', 0, 1
),
(
  'pm4', 'p4', 'image', null,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
  'حذاء رياضي احترافي', 0, 1
),
(
  'pm5', 'p5', 'image', null,
  'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=1200&auto=format&fit=crop',
  'سماعات لاسلكية برو', 0, 1
);

insert into orders (
  id, buyer_user_id, seller_id,
  order_status, payment_method, payment_status, shipping_status, currency,
  subtotal_mad, shipping_fee_mad, discount_mad, total_mad,
  customer_full_name, customer_phone, customer_city, customer_address,
  customer_notes, shipping_method
) values
(
  'o1', 'u3', 's1',
  'confirmed', 'cash_on_delivery', 'pending', 'pending', 'MAD',
  3998, 40, 0, 4038,
  'Buyer One', '0600000003', 'الدار البيضاء', 'حي إداري 12',
  'يرجى الاتصال قبل التسليم', 'standard'
),
(
  'o2', 'u4', 's2',
  'shipped', 'card', 'paid', 'shipped', 'MAD',
  1148, 35, 0, 1183,
  'Buyer Two', '0600000010', 'الرباط', 'أكدال 24',
  null, 'express'
);

insert into order_items (
  id, order_id, product_id, seller_id,
  product_title_snapshot, sku_snapshot,
  quantity, unit_price_mad, line_total_mad
) values
(
  'oi1', 'o1', 'p1', 's1',
  'هاتف Samsung Galaxy A55', 'SGA55-001',
  1, 3499, 3499
),
(
  'oi2', 'o1', 'p5', 's1',
  'سماعات لاسلكية برو', 'EAR-005',
  1, 499, 499
),
(
  'oi3', 'o2', 'p2', 's2',
  'مصباح أرضي عصري', 'LAMP-002',
  1, 349, 349
),
(
  'oi4', 'o2', 'p4', 's2',
  'حذاء رياضي احترافي', 'RUN-004',
  1, 799, 799
);

insert into order_events (
  id, order_id, event_type, payload_json
) values
(
  'oe1', 'o1', 'order_created',
  '{"source":"seed","note":"Initial seeded order"}'
),
(
  'oe2', 'o1', 'order_confirmed',
  '{"by":"seller","seller_id":"s1"}'
),
(
  'oe3', 'o2', 'order_created',
  '{"source":"seed","payment":"card"}'
),
(
  'oe4', 'o2', 'order_shipped',
  '{"tracking":"DEMO-TRACK-001"}'
);
