# Souq Rahba Platform

منصة Marketplace مغربية شاملة مبنية اعتماداً على الملفات التي رفعتها، مع تحويل الهوية إلى **سوق رحبة** وتوسيع التخصص ليشمل:

- الإلكترونيات
- الأجهزة المنزلية
- الأدوات والمعدات
- المعدات المهنية
- الفلاحة والسقي
- الصيد والبحر
- البناء والورش
- الأزياء والحرف
- المواد الغذائية
- ملحقات السيارات

## ما يوجد داخل المشروع

- `apps/storefront`: واجهة العميل عبر React + Vite
- `apps/admin`: بداية لوحة الإدارة
- `workers/api`: API عبر Hono + Cloudflare Workers
- `workers/webhooks`: webhooks
- `infra/d1`: schema و seed لقاعدة البيانات
- `apps/storefront/src/pages/ShowcasePage.jsx`: التصميم الكبير المعتمد من ملف `SouqMaZellige.jsx`

## مسارات مهمة

- `/` الصفحة الرئيسية المختصرة
- `/products` المنتجات
- `/sellers` الباعة
- `/seller/dashboard` لوحة البائع
- `/showcase` الواجهة الكبيرة المعتمدة على التصميم المرفوع

## تشغيل محلي

```bash
pnpm install
pnpm --filter storefront dev
```

## API

```bash
pnpm --filter api dev
```

## ملاحظة

هذه النسخة أساس عملي وقابل للتوسعة. ما يزال يلزمك بعد ذلك:

1. ربط storefront بقاعدة D1 الحقيقية بدل البيانات الثابتة.
2. بناء نظام auth فعلي.
3. إضافة الدفع والشحن المغربي.
4. إكمال seller portal و admin.
