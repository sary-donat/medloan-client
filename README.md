# medloan-client

לקוח React לגמ"ח ציוד רפואי (MedLoan): רשימת ציוד, השאלה, החזרה והתחברות.
מנהל מקבל תפריט "ניהול": השאלות, פריטים ועותקים, קטגוריות, תגיות וחברים.
התפריט וה-route guard הם לנוחות בלבד. השרת בודק את ההרשאה בכל בקשה.

## הרצה

השרת (`MedLoan.Api`) צריך לרוץ במקביל, על `http://localhost:5062`.

```
npm install
cp .env.example .env
npm run dev
```

ב-Windows (PowerShell), במקום `cp`: `Copy-Item .env.example .env`.

האפליקציה נפתחת ב-`http://localhost:5173`. השרת מתיר CORS רק לכתובת הזו.

## הגדרות

| משתנה | תפקיד |
|---|---|
| `VITE_API_URL` | כתובת השרת. ב-`.env.example`: `http://localhost:5062` |

הקובץ `.env` לא נכנס ל-repo.

## פריסה ל-Render (Static Site)

| הגדרה | ערך |
|---|---|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment Variable | `VITE_API_URL` = כתובת השרת ב-Render, למשל `https://<server>.onrender.com` (בלי `/` בסוף) |
| Redirects/Rewrites | Source `/*`, Destination `/index.html`, Action `Rewrite` |

- `VITE_API_URL` נקרא **בזמן הבנייה** ונכנס לקוד שנבנה. אחרי שינוי שלו צריך להריץ build מחדש של ה-Static Site (Manual Deploy).
- ה-rewrite נדרש כי הניווט נעשה בצד הלקוח (`react-router-dom`). בלי ה-rewrite, רענון של כתובת כמו `/my-loans` מחזיר 404.
- בשרת, `Cors__AllowedOrigins__0` צריך להיות הכתובת של ה-Static Site, אחרת הדפדפן חוסם את הבקשות.

## משתמשי דמו

| Email | Password |
|---|---|
| member1@medloan.local | Member123! |
| member2@medloan.local | Member123! |
| admin@medloan.local | Admin123! (מנהל) |
