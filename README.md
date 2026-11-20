# BlueBank Monorepo

یک پلتفرم نئوبانک Production-Ready و تمام‌عیار، توسعه داده‌شده با معماری **Turborepo** و **pnpm Workspaces**.

---

## 🏛 معماری پروژه (System Architecture)

این ساختار شامل تفکیک دقیق دامنه‌ها، پکیج‌های اشتراکی تایپ‌سیف و میکروسرویس‌های فرانت‌اند و بک‌اند است:

```text
.
├── apps/
│   ├── client/           # فرانت‌اند کاربری - Next.js (App Router) + TypeScript [Port: 3000]
│   ├── panel/            # داشبورد مدیریت و مانیتورینگ - Vite + React + TypeScript [Port: 3001]
│   └── core-banking/     # هسته پردازش بانکی - NestJS + TypeScript (SWC) [Port: 4000]
└── packages/
    ├── contracts/        # قراردادهای DTO، اسکیماهای Zod و ساختار ApiResponse/Error (CJS/ESM)
    ├── ui/               # پکیج کامپوننت‌ها و توکن‌های طراحی JIT بدون بیلد
    ├── typescript-config/# کانفیگ‌های اشتراکی TypeScript (base, nextjs, vite-react, nestjs)
    └── eslint-config/    # کانفیگ اشتراکی ESLint Flat Config + Prettier
```

---

## 🚀 پیش‌نیازها

- **Node.js**: `^20.0.0 || ^22.0.0 || ^24.0.0` (قفل شده روی `v24.18.0` در `.nvmrc`)
- **pnpm**: `^10.0.0 || ^11.0.0` (قفل شده در `packageManager`)

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

## 🛡 کنترل کیفیت و استانداردهای توسعه (DX & CI)

- **Husky & lint-staged**: اعتبارسنجی خودکار فرمت و استانداردهای لنتینگ قبل از هر کامیت.
- **Commitlint**: الزام رعایت قواعد [Conventional Commits](https://www.conventionalcommits.org/).
- **Fail-Fast Environment Validation**: اعتبارسنجی کلیه متغیرهای محیطی در لحظه راه‌اندازی (Boot Time) با **Zod**.
- **Zero-Friction Integration**: کامپایل دوگانه CJS/ESM در `@repo/contracts` و HMR بی‌درنگ در `@repo/ui` بدون نیاز به ریست سرور.
- **Docker-Ready**: سازگاری کامل با `turbo prune <app> --docker` جهت بیلدهای کم‌حجم Multi-stage در محیط کانتینر.
