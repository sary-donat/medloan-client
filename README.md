# medloan-client

לקוח React לגמ"ח ציוד רפואי (MedLoan): רשימת ציוד, השאלה, החזרה והתחברות.
מנהל מקבל תפריט "ניהול": השאלות, פריטים ועותקים, קטגוריות, תגיות וחברים.
התפריט וה-route guard הם לנוחות בלבד. השרת בודק את ההרשאה בכל בקשה.

- אתר: https://medloan-client.onrender.com
- שרת: https://medloan-server.onrender.com (Swagger: https://medloan-server.onrender.com/swagger)

בגישה הראשונה אחרי זמן בלי שימוש, הטעינה יכולה לקחת עד דקה.

## התחברות והתנתקות

- אחרי התחברות או הרשמה נשמרים ב-`localStorage` גם ה-access token (‏15 דקות) וגם ה-refresh token (‏7 ימים).
- **חידוש אוטומטי:** כשבקשה מקבלת 401 כי ה-access token פג, הלקוח שולח `POST /api/auth/refresh` פעם אחת, ואז חוזר על הבקשה המקורית. אם כמה בקשות נכשלו יחד, כולן מחכות לאותה בקשת refresh. רק אם החידוש נכשל, ה-tokens נמחקים והמשתמש מועבר למסך ההתחברות.
- **"התנתק"** (בסרגל העליון, ליד שם המשתמש): שולח `POST /api/auth/logout` כדי לבטל את ה-refresh token בשרת, מוחק את ה-tokens ומעביר למסך ההתחברות. אם הבקשה נכשלת, למשל בלי רשת, ה-tokens נמחקים בכל זאת.

## הרצה

דרישות: Node 22 ומעלה.

השרת (`MedLoan.Api`) צריך לרוץ במקביל, על `http://localhost:5062`. ההוראות להרצה שלו ב-README של ה-repo `medloan-server`.

```bash
npm install
cp .env.example .env
npm run dev
```

ב-Windows (PowerShell), במקום `cp`:

```powershell
Copy-Item .env.example .env
```

האפליקציה נפתחת ב-`http://localhost:5173`. השרת מתיר CORS בפיתוח רק לכתובת הזו.

בנייה לפריסה (התוצאה בתיקייה `dist`):

```bash
npm run build
```

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
