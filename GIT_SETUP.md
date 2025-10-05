# أوامر إعداد Git

## قم بتشغيل هذه الأوامر في PowerShell (غيّر الاسم والإيميل):

```bash
git config --global user.name "اسمك الحقيقي"
git config --global user.email "your-email@example.com"
```

## مثال:
```bash
git config --global user.name "أحمد علي"
git config --global user.email "ahmed@gmail.com"
```

## بعد الإعداد، شغل:
```bash
git commit -m "إضافة مدير الجدول الدراسي مع ميزة اسم المدرس والأوقات المسائية"
git branch -M main
git remote add origin https://github.com/USERNAME/schedule-manager.git
git push -u origin main
```

## استبدل USERNAME باسم حسابك على GitHub!

## بعد الرفع:
1. اذهب إلى مستودعك على GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Save

## الرابط النهائي سيكون:
```
https://USERNAME.github.io/schedule-manager/
```