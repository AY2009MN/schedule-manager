# تعليمات نشر المشروع على GitHub Pages

## الخطوات:

### 1. إنشاء مستودع GitHub جديد
1. اذهب إلى https://github.com
2. اضغط على "New repository"
3. اكتب اسم المستودع: `schedule-manager`
4. اختر "Public"
5. لا تختر إضافة README (لأنه موجود بالفعل)
6. اضغط "Create repository"

### 2. رفع الملفات
افتح Command Prompt أو PowerShell في مجلد المشروع وشغل:

```bash
git init
git add .
git commit -m "إضافة مدير الجدول الدراسي"
git branch -M main
git remote add origin https://github.com/USERNAME/schedule-manager.git
git push -u origin main
```

### 3. تفعيل GitHub Pages
1. اذهب إلى Settings في المستودع
2. اختر "Pages" من الجانب الأيسر
3. في Source اختر "Deploy from a branch"
4. اختر Branch: "main"
5. اختر Folder: "/ (root)"
6. اضغط "Save"

### 4. الرابط النهائي
سيكون الرابط:
```
https://USERNAME.github.io/schedule-manager/
```

## البديل: استخدام GitHub Desktop
1. حمل GitHub Desktop
2. اضغط "Add an Existing Repository from your Hard Drive"
3. اختر مجلد المشروع
4. اضغط "Publish repository"
5. فعل GitHub Pages كما هو موضح أعلاه

## المميزات:
✅ رابط مباشر ودائم
✅ يعمل على جميع الأجهزة
✅ سرعة عالية
✅ مجاني بالكامل
✅ يمكن مشاركته مع أي شخص