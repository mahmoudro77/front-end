# Allure Events Frontend

واجهة أمامية تجريبية لنظام **Allure Events** لإدارة حفلات الأعراس والفعاليات والحجوزات والموظفين والدلائل.

المشروع مبني باستخدام React وVite، ويعمل حالياً بشكل مستقل عن الـBackend باستخدام بيانات Mock و`localStorage`.

## المتطلبات

- Node.js 18 أو أحدث.
- npm.

## التشغيل

```bash
npm install
npm run dev
```

بعدها افتح الرابط الذي يظهر في الطرفية، وغالباً يكون:

```text
http://localhost:5173
```

## الأوامر المتوفرة

```bash
npm run dev      # تشغيل بيئة التطوير
npm run lint     # فحص الكود
npm run build    # إنشاء نسخة الإنتاج
npm run preview  # معاينة نسخة الإنتاج
```

## تسجيل الدخول التجريبي

تسجيل الدخول الحالي Mock ولا يتصل بخادم مصادقة حقيقي.

يمكن استخدام أي بريد إلكتروني صحيح وأي كلمة مرور غير فارغة:

```text
Email: admin@allureevents.com
Password: admin123
```

التحقق الحالي يتأكد من إدخال البريد وكلمة المرور واحتواء البريد على الرمز `@`.

## المزايا الحالية

- Dashboard مع مؤشرات مالية وتشغيلية.
- أرشيف الإضبارات والفعاليات مع البحث والتصفية والـPagination.
- إنشاء وتعديل وحذف الإضبارات.
- قالب Wedding وقالب General Event.
- حساب التكلفة والعربون والمبلغ المتبقي.
- حالات الدفع: Paid وPartial payment وUnpaid.
- كشف تعارض القاعة والتاريخ والساعة.
- تقويم حجوزات Month / Week / Day.
- إدارة القاعات والموردين والموظفين والعملاء.
- CRUD محلي للفعاليات والدلائل.
- مهام منظمة داخل الإضبارة.
- تصدير الإضبارة إلى PDF.
- تصدير واستيراد بيانات JSON وإعادة بيانات العرض.
- دعم العربية والإنجليزية مع RTL وLTR.
- تصميم متجاوب وانتقالات وحركات بسيطة.

## بنية المشروع

```text
src/
├── assets/
├── components/
│   ├── DirectoryForm.jsx
│   └── ui.jsx
├── data/
│   └── mockData.json
├── pages/
│   ├── DashboardPage.jsx
│   ├── DirectoryPage.jsx
│   ├── LoginPage.jsx
│   └── SettingsPage.jsx
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

## البيانات والتخزين

يتم استخدام [mockData.json](./src/data/mockData.json) كبيانات أولية عند أول تشغيل.

بعد ذلك يتم حفظ التغييرات في `localStorage`:

```text
allure-events
allure-directories
allure-auth
allure-language
```

لا يتم تعديل ملف `mockData.json` مباشرة من المتصفح؛ فهو يستخدم كبذرة أولية فقط. تعديلات المستخدم تحفظ محلياً داخل المتصفح.

يمكن إدارة البيانات من صفحة **Settings**:

- Export JSON
- Import JSON
- Reset demo data

## ملاحظات مهمة

- لا يوجد Backend متصل حالياً.
- لا يوجد JWT حقيقي؛ تسجيل الدخول تجريبي.
- بيانات `localStorage` مرتبطة بالمتصفح والجهاز الحالي.
- حذف بيانات المتصفح يؤدي إلى فقدان التغييرات المحلية.
- قد يظهر تحذير من Vite حول حجم Bundle بسبب `html2pdf.js`، ولا يمنع البناء.

## الربط المستقبلي مع Backend

عند إضافة Django REST API يمكن استبدال طبقة `localStorage` بخدمات API للمصادقة، الإضبارات، الحجوزات، الموظفين، المهام، القاعات، الموردين، والإعدادات.

يفضل إبقاء بيانات Mock الحالية كخيار تشغيل تجريبي أثناء التطوير.

## الحالة الحالية

المشروع Frontend Prototype متكامل نسبياً ومناسب للعرض والتجربة. حالياً يتصل بطبقة Fake REST API محلية عبر `json-server`، وتُحفظ البيانات في [db.json](./db.json).

### Fake API

يتم تشغيل الخادم من ملف [db.json](./db.json)، ثم تتعامل الواجهة مع العمليات التالية عبر طبقة [src/services/fakeApi.js](./src/services/fakeApi.js):

- `getEvents`, `saveEvent`, `deleteEvent`
- `getDirectories`, `saveDirectory`, `deleteDirectory`
- `replaceData` للاستيراد
- `reset` لإعادة البيانات التجريبية

لتشغيل الواجهة والخادم معاً:

```bash
npm run dev:all
```

أو في نافذتين منفصلتين:

```bash
npm run api
npm run dev
```

الخادم يعمل على `http://localhost:3001`، ويمكن تغيير الرابط عبر `VITE_API_URL`. عند إضافة Django REST API لاحقاً، يمكن استبدال عناوين الموارد داخل [fakeApi.js](./src/services/fakeApi.js) مع إبقاء مكونات الواجهة كما هي.
