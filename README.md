# TrustMitra Phase 3

TrustMitra is a premium dark-tech prototype for reliable local services in India. This Phase 3 version includes:

- session auth + OTP-ready login routes
- route protection middleware
- customer booking flow with auto-match
- worker dashboard with arrival, completion, and proof upload
- customer confirmation, rating, and dispute flow
- admin queue for worker approvals and ticket resolution
- notification queue + audit log foundation
- upload API for issue photos, completion proof, and worker documents
- payment-order and webhook foundation for Razorpay-style integration

## Recommended stack

- Next.js app router
- Prisma ORM
- SQLite for local dev
- PostgreSQL recommended later for deployment
- Local file uploads now, Cloudinary/S3 next
- Mock payment provider now, Razorpay-ready abstraction included

## Local run in VS Code

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

Open:

- http://localhost:3000/
- http://localhost:3000/auth
- http://localhost:3000/book
- http://localhost:3000/customer
- http://localhost:3000/worker
- http://localhost:3000/admin
- http://localhost:3000/worker-onboarding

## Default seeded test users

- Customer: `9999999901`
- Admin: `9999999900`
- Worker: `9999999902`
- Demo OTP: `123456`

## Notes

- Uploads save into `public/uploads` in local dev.
- For real OTP, replace the demo request/verify routes with SMS provider calls.
- For real payments, switch `PAYMENT_PROVIDER=razorpay` and wire a real order creation API + webhook secrets.
- For production, migrate Prisma datasource to PostgreSQL and store uploads on Cloudinary or S3.
