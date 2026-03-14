# سوق رحبة | Souq Rahba Platform 🇲🇦

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-green)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Database-D1-yellow)](https://developers.cloudflare.com/d1/)
[![React](https://img.shields.io/badge/Framework-React-purple)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Backend-Hono-orange)](https://hono.dev/)

**المنصة الرسمية:** [🌐 rahba.site](https://rahba.site)  
**حالة المشروع:** ✅ نشط ومنشور بنجاح

</div>

---

## 📖 نظرة عامة

**سوق رحبة** هي منصة Marketplace مغربية متكاملة تربط البائعين بالمشتريين في بيئة آمنة وسريعة. صممت خصيصاً للسوق المغربي مع دعم كامل للغة العربية وواجهة عصرية متجاوبة.

### 🎯 المزايا التنافسية

| الميزة | التفاصيل |
|--------|----------|
| **اللغة العربية** | واجهة RTL كاملة ودعم خط عربي أنيق |
| **سرعة عالية** | استضافة serverless على حافة Cloudflare |
| **قابلية التوسع** | بنية قابلة للنمو مع D1 و Workers |
| **أمان مضمون** | SSL مجاني + حماية DDoS تلقائية |

---

## 🌐 الروابط الرئيسية

| القسم | الرابط | الوصف |
|-------|---------|-------|
| 🏪 **المتجر الرئيسي** | [rahba.site](https://rahba.site) | تصفح المنتجات وشراءها |
| 👨‍💼 **بوابة البائعين** | [seller.rahba.site](https://seller.rahba.site) | إدارة منتجاتك ومبيعاتك |
| ⚙️ **لوحة الإدارة** | [admin.rahba.site](https://admin.rahba.site) | التحكم الشامل بالنظام |
| ⚡ **واجهة API** | [api.rahba.site](https://api.rahba.site) | خدمات Backend & Webhooks |

---

## ✨ المميزات الحالية

### للمشتريين
- [x] تصفح فئات متنوعة من المنتجات
- [x] البحث المتقدم والفلاتر الذكية
- [x] عرض تفاصيل المنتجات والصور
- [x] تقييمات ومراجعات المستخدمين
- [x] تصميم عربي متجاوب مع الجوال

### للبائعين
- [x] لوحة تحكم خاصة لإدارة المنتجات
- [x] إضافة وتعديل وحذف المنتجات
- [x] متابعة الطلبات والمبيعات
- [x] إحصائيات الأداء الزمنية
- [x] صور متعددة للمنتج الواحد

### للإدارة
- [x] مراقبة حالة النظام بشكل عام
- [x] إدارة حسابات المستخدمين
- [x] مراجعة واعتماد المحتوى
- [x] تحليلات البيانات والأداء
- [x] نظام تذاكر الدعم الفني

---

## 🛠 التقنيات المستخدمة

### Frontend Stack
```yaml
Framework: React 18 + Vite 5
Language: TypeScript 5
Styling: CSS Modules / Tailwind CSS
State Management: Zustand / React Query
Routing: React Router DOM v6
```

### Backend Stack
```yaml
Runtime: Cloudflare Workers
Framework: Hono.js (Bun/Hono compatible)
Database: Cloudflare D1 (SQLite)
Authentication: JWT + HTTP-only cookies
Deployment: Edge Network Worldwide
```

### DevOps & Tools
```yaml
Package Manager: pnpm 8+
Version Control: Git + GitHub Actions
Testing: Vitest + Playwright
CI/CD: Auto-deploy via Push
```

---

## 📂 هيكل المشروع

```
souq-rahba-platform/
├── apps/
│   ├── storefront          # واجهة المتجر للمشترين
│   │   └── src/
│   │       ├── components/ # المكونات المشتركة
│   │       ├── pages/      # صفحات التطبيق
│   │       └── hooks/      # Custom Hooks
│   └── admin               # لوحة إدارة الإدارة
│       └── src/
│           ├── auth/       # تسجيل الدخول والإذن
│           ├── users/      # إدارة المستخدمين
│           └── analytics/  # الإحصائيات
├── workers/
│   ├── api                 # خدمات الـ API الخلفية
│   │   ├── routes/         # مسارات RESTful
│   │   ├── middleware/     # Middleware للتحقق
│   │   └── utils/          # دوال مساعدة
│   └── webhooks            # معالجة الأحداث الخارجية
├── infra/
│   └── d1                  # مخطط وقاعدة البيانات
│       ├── schema.sql      # تعريف الجداول
│       └── seed.sql        # البيانات الأولية
└── packages                # الحزم المشتركة
    ├── ui-kit              # مكونات واجهة مشتركة
    ├── utils               # دوال مساعدة
    └── types               # تعريفات TypeScript
```

---

## 🚀 الإعداد المحلي

### المتطلبات المسبقة
- Node.js 18 أو أحدث
- pnpm (يوصى بشدة)
- Docker (اختياري - لخدمات المساعدة)

### خطوات التثبيت

```bash
# 1. Clone المستودع
git clone https://github.com/ori00fit-tech/souq-rahba-platform.git
cd souq-rahba-platform

# 2. تثبيت جميع الاعتمادات
pnpm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# عدل .env بإعدادات Cloudflare الخاصة بك
```

### تشغيل الخدمات

```bash
# تطوير واجهة المتجر
pnpm --filter storefront dev

# تطوير بوابة البائعين
pnpm --filter seller dev

# تطوير API
pnpm --filter api dev

# التطوير الشامل
pnpm dev
```

### البناء للنشر

```bash
# بناء جميع التطبيقات
pnpm build

# اختبار سريع قبل النشر
pnpm test

# تشغيل اختبارات الوحدة
pnpm test:unit

# تشغيل اختبارات التكامل
pnpm test:e2e
```

---

## 🔐 ملفات البيئة (.env)

```env
# Cloudflare Settings
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_D1_DATABASE_ID=your_d1_id

# Application
APP_NAME=Sourq Rahba
APP_ENV=production
API_URL=https://api.rahba.site
FRONTEND_URL=https://rahba.site

# Database (D1)
DATABASE_URL=d1://YOUR_DATABASE_ID
```

---

## 📊 حالة التطوير

### ✅ مكتمل (v1.0)
| المكون | التاريخ | الحالة |
|--------|---------|--------|
| واجهة المتجر الرئيسية | فبراير 2026 | ✅ مكتمل |
| قاعدة بيانات D1 الأساسية | مارس 2026 | ✅ مكتملة |
| بوابة البائعين | مارس 2026 | ✅ مكتملة |
| النشر الأولي | مارس 2026 | ✅ منشور |

### 🔄 قيد التطوير (v1.1)
| الميزة | الأولوية | تقدير الانتهاء |
|--------|----------|----------------|
| نظام المصادقة الكامل | 🔴 عالي | أبريل 2026 |
| تكامل الدفع الإلكتروني | 🔴 عالي | مايو 2026 |
| لوحة الإدارة المتقدمة | 🟡 متوسط | يونيو 2026 |
| إشعارات البريد الإلكتروني | 🟢 منخفض | يوليو 2026 |

### 📅 Roadmap المستقبلية
- [ ] تطبيق هاتف ذكي (React Native)
- [ ] بوابات دفع محلية مغربية (CMI, Wafacash)
- [ ] توصيل ذكي ومتابعة شحن
- [ ] نظام عروض وتخصيصات
- [ ] ميزة الدردشة المباشرة بين البائع والمشترى

---

## 🤝 المساهمة في المشروع

يسعدنا مساهمات الجميع! إليك كيفية البدء:

### الخطوات
1. [Fork](https://github.com/ori00fit-tech/souq-rahba-platform/fork) هذا المستودع
2. أنشئ فرعاً جديداً (`git checkout -b feature/amazing-feature`)
3. قم بالتغييرات commit (`git commit -m 'add amazing feature'`)
4. Push الفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

### قواعد المساهمة
- استخدم commits ذات رسائل واضحة وواضحة
- اكتب tests جديدة لكل feature جديد
- حدّث الوثائق عند الضرورة
- راجع التعليمات البرمجية وفقاً لـ ESLint و Prettier

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر تحت رخصة [MIT](LICENSE).

```
MIT License

Copyright (c) 2026 Ori00Fit-Tech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📮 الدعم والتواصل

| القناة | الرابط |
|--------|---------|
| 🐙 مستودع GitHub | [ori00fit-tech/souq-rahba-platform](https://github.com/ori00fit-tech/souq-rahba-platform) |
| 📧 البريد الإلكتروني | *للإنشاء قريباً* |
| 💬 Discord | *قادم قريباً* |
| 🐦 Twitter/X | *قادم قريباً* |

---

## 📈 الإحصائيات

```
┌─────────────────────────────┬─────────────┐
│ المعيار                    │ القيمة       │
├─────────────────────────────┼─────────────┤
│ إجمالي الملفات            │ ~150 ملف      │
│ خطوط برمجية (SLOC)         │ ~2,500 سطر   │
│ لغات البرمجة                │ JS: 87%     │
│                             │ TS: 11%     │
│                             │ CSS: 2%     │
│ حجم مجلد src               │ ~85 MB       │
│ سرعة الاستجابة (Edge)      │ <150ms       │
│ نسبة توفر الخدمة             │ 99.9%        │
│ عدد النطاقات الفرعية        │ 4 نطاقات     │
└─────────────────────────────┴─────────────┘
```

---

## 🎨 المطور الرئيسي

<div align="center">

**Ori00Fit-Tech** — مطور برمجيات مغربي متخصص في بناء حلول الويب الحديثة والبنية التحتية السحابية.

[![GitHub Profile](https://img.shields.io/badge/GitHub-or i00fit--tech-blue?style=social&logo=github)](https://github.com/ori00fit-tech)

<div align="center">

**شكراً لاستخدام سوق رحبة**  
*نسعى دائماً لتقديم الأفضل للمجتمع المغربي الرقمي 🇲🇦*

</div>
</div>

---

<sub>*آخر تحديث: 14 مارس 2026*</sub>
