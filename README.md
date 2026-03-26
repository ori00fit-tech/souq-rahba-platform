
🛒 Souq Rahba Platform 
سوق رحبة هي منصة تجارة إلكترونية متكاملة (SaaS-ready) مبنية بمعمارية Monorepo حديثة. المنصة مصممة لتكون خفيفة، سريعة، وقابلة للتوسع بفضل تقنيات Cloudflare Edge Computing.
🏗 بنية النظام (Architecture)
المشروع كيعتمد على تقسيم ذكي للمهام لضمان سهولة الصيانة:
 * apps/storefront: واجهة الزبناء (B2C) - تجربة تسوق سريعة (React + Vite).
 * apps/seller-portal: لوحة تحكم التجار لإدارة المنتجات والطلبيات.
 * apps/admin: لوحة تحكم الإدارة المركزية (الموافقة على التجار، الإحصائيات).
 * workers/api: المحرك الخلفي (Backend) مبني بـ Hono ويعمل على Cloudflare Workers.
 * packages/shared: مكتبة مشتركة تحتوي على الـ API Client ومنطق الأعمال الموحد.
🚀 المميزات التقنية (Core Features)
 * ✅ Unified Response System: نظام استجابة موحد (ok/fail) كيسهل الـ Error Handling فـ الـ Frontend.
 * ✅ Edge-First: كاع الـ API والـ Database (D1) خدامين فـ الـ Edge (أقرب نقطة للمستخدم).
 * ✅ Optimized Catalog: دمج بيانات المنتج والتقييمات فـ Endpoint واحد لتقليل الـ Latency.
 * ✅ Role-Based Access (RBAC): نظام صلاحيات صارم بين (Admin, Seller, Buyer).
 * ✅ WhatsApp Notifications: نظام تنبيهات آلي للطلبيات عبر WhatsApp API.
🛠 التكنولوجيات (Tech Stack)
| الطبقة (Layer) | التقنيات المستخدمة |
|---|---|
| Frontend | React 18, React Router 7, Tailwind CSS, Vite |
| Backend | Hono Framework, TypeScript |
| Runtime | Cloudflare Workers (Serverless) |
| Database | Cloudflare D1 (SQL) |
| Storage | Cloudflare R2 (S3 Compatible) |
| DevOps | Pnpm Workspaces, TurboRepo, GitHub Actions |
💻 طريقة التشغيل (Setup)
 * استنساخ المستودع:
   git clone https://github.com/username/souq-rahba.git
cd souq-rahba

 * تثبيت المكتبات:
   pnpm install

 * إعداد البيئة:
   قم بإنشاء ملف .env في workers/api ووضع الإعدادات اللازمة (D1 ID, WhatsApp Token).
 * التشغيل المحلي:
   pnpm dev

📉 حالة المشروع (Status)
 * [x] توحيد الـ API Responses (Normalization).
 * [x] تحسين أداء صفحة تفاصيل المنتج.
 * [ ] إتمام نظام الشحن (Logistics Logic).
 * [ ] إضافة واجهة لغات متعددة (i18n).
🤝 المساهمة (Contributing)
نرحب بكل المساهمات! إذا كان عندك شي تحسين أو اكتشفتي شي Error، حل Issue أو صيفط Pull Request.
شنو رأيك فـ هاد النموذج؟
واش نزيد فيه شي سكشن خاص بـ الـ Database Schema (الجداول) باش يبان الاحتراف فـ تصميم قاعدة البيانات؟

