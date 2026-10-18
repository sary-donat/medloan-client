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

## משתמשי דמו

| Email | Password |
|---|---|
| member1@medloan.local | Member123! |
| member2@medloan.local | Member123! |
| admin@medloan.local | Admin123! (מנהל) |
