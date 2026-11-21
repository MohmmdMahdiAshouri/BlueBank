# BlueBank Monorepo

یک پلتفرم نئوبانک Production-Ready توسعه داده‌شده با معماری **Turborepo** و **pnpm Workspaces** با آخرین نسخه‌های اکوسیستم مدرن جاوااسکریپت و تایپ‌اسکریپت.

---

## 🏛 معماری پروژه (System Architecture)

```text
.
└── apps/
    ├── client/           # فرانت‌اند کاربری - Next.js 16 (App Router) + TypeScript [Port: 3000]
    ├── panel/            # داشبورد مدیریت و مانیتورینگ - Vite 8 + React 19 + TypeScript [Port: 3001]
    └── core-banking/     # هسته پردازش بانکی - NestJS 12 + Fastify + TypeScript (SWC) [Port: 4000]
```

---

## 🚀 پیش‌نیازها و نسخه‌ها

- **Node.js**: `v24.18.0` (قفل شده در `.nvmrc`)
- **pnpm**: `v11.24.0` (قفل شده در `packageManager`)
- **Next.js**: `v16.4.6`
- **React**: `v19.3.1`
- **Vite**: `v8.3.8`
- **NestJS**: `v12.6.0` (با آداپتور کارآمد **Fastify 5**)
- **TypeScript**: `v6.0.3`
- **Turborepo**: `v2.11.13`
- **Zod**: `v4.6.7`
- **ESLint**: `v10.15.0`

---

## 🛠 دستورات کلیدی (Key Scripts)

| دستور             | توضیح                                                      |
| :---------------- | :--------------------------------------------------------- |
| `pnpm install`    | نصب کلیه وابستگی‌های مونوریپو با pnpm workspaces           |
| `pnpm dev`        | اجرای همزمان تمام سرویس‌ها با پایپ‌لاین موازی Turborepo    |
| `pnpm dev:client` | اجرای تکی فرانت‌اند Next.js روی پورت 3000                  |
| `pnpm dev:panel`  | اجرای تکی داشبورد ادمین Vite روی پورت 3001                 |
| `pnpm dev:api`    | اجرای تکی میکروسرویس Core-Banking روی پورت 4000            |
| `pnpm build`      | بیلد کامل پروژه‌ها و پکیج‌ها با رعایت دقیق درخت وابستگی‌ها |
| `pnpm lint`       | بررسی کیفی کد با ESLint Flat Config                        |
| `pnpm typecheck`  | بررسی سلامت تایپ‌ها در تمام پکیج‌ها و برنامه‌ها            |
| `pnpm format`     | فرمت‌بندی خودکار فایل‌ها با Prettier                       |
| `pnpm clean`      | پاکسازی کش Turborepo، پوشه‌های dist و node_modules         |

---

## 🛡 قوانین ایجنت‌ها و کیفیت کد

- مطابق با قانون مندرج در [AGENTS.md](file:///home/mohammad/Desktop/Programming/my-projects/BlueBank/AGENTS.md)، تمام فرآیندها مبتنی بر اصل **One Prompt, One Review, One Commit** کنترل می‌شوند.
- سوابق و دلایل تصمیمات کلیدی معماری در [DECISIONS.md](file:///home/mohammad/Desktop/Programming/my-projects/BlueBank/DECISIONS.md) مستندسازی شده است.
