# FitDocs — Thư viện tài liệu Fitness

## Mô tả dự án
Thư viện tài liệu Fitness trực tuyến. Đọc PDF/DOCX/Video online, không tải được. Share-to-Unlock: phải chia sẻ lên Facebook mới xem được tài liệu. 2 giao diện: Admin (quản lý) + User (đọc).

## Tech Stack
- **Framework**: Next.js 16 + TypeScript (App Router)
- **Database**: PostgreSQL + Drizzle ORM
- **Storage**: AWS S3 (file storage, presigned URLs)
- **Styling**: Tailwind CSS v4, dark mode

## Cấu trúc key files
- `src/lib/db.ts` — Drizzle ORM client (PostgreSQL)
- `src/lib/s3.ts` — S3 helper, presigned URL generator
- `src/db/schema.ts` — Database schema
- `src/app/api/` — API routes
- `src/app/(user)/` — User-facing pages
- `src/app/admin/` — Admin panel

## Environment Variables (.env.local)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/fitdocs
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=fitdocs-documents
ADMIN_PASSWORD_HASH=...
ADMIN_SECRET=...
FACEBOOK_APP_ID=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Key Architecture Decisions
- S3 presigned URLs với TTL 15 phút — không bao giờ expose raw S3 path
- PDF/DOCX: phục vụ qua API proxy route
- Video: stream qua signed URL + range requests
- Admin auth: HMAC-signed cookie đơn giản (không JWT)
- Anonymous user: UUID cookie + fingerprintjs

## Plans
Kế hoạch chi tiết: `../plans/20260324-0812-fitdocs-library/plan.md`
