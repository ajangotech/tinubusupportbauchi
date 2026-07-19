# Tinubu Support Bauchi 2027 — Backend API

RESTful Node.js/Express + MySQL backend for membership, corporate registration, blog, events, and admin management.

## Stack

- Node.js, Express.js, MySQL, Sequelize ORM
- JWT auth, bcrypt, role-based access control
- Multer (uploads), Nodemailer (email), PDFKit (PDF), qrcode (QR codes)
- Helmet, CORS, express-rate-limit, Joi validation
- Morgan logging, compression

## Structure

See the `src/` tree in the project root prompt for the full layout.

## Setup

```bash
cd backend
cp .env.example .env   # then edit values
npm install
npm run db:sync         # create tables from Sequelize models (dev only)
# or import database/schema.sql into MySQL directly
npm run dev
```

## Default super admin (created by `npm run db:seed`)

```
email: admin@tinubusupportbauchi2027.org
password: Admin@2027
```

## API overview

### Auth (`/api/auth`)
- `POST /register`, `POST /login`, `POST /logout`, `GET /me`
- `POST /forgot-password`, `POST /reset-password`

### Members (`/api/members`)
- `POST /register`, `GET /profile`, `PUT /profile`, `GET /card`, `GET /verify/:membershipNumber`

### Corporate (`/api/corporate`)
- `POST /register`, `GET /profile`, `PUT /profile`, `GET /certificate`

### Blog (`/api/blog`)
- `GET /`, `GET /:slug`

### Events (`/api/events`)
- `GET /`, `GET /:slug`

### Leadership (`/api/leadership`)
- `GET /`

### Contact (`/api/contact`)
- `POST /`

### Newsletter (`/api/newsletter`)
- `POST /subscribe`, `GET /unsubscribe`

### Admin (`/api/admin`)
- Dashboard stats, members, corporates, blog, events, leadership, messages, subscribers, notifications, activity logs

## Roles

`super_admin`, `admin`, `membership_officer`, `corporate_officer`, `editor`, `member`, `corporate_user`

## File uploads

Stored under `uploads/{members,corporate,blog,leadership}` and served at `/uploads`.

## Notes

- This is source code only; it must be run on a host with Node.js and MySQL.
- Run `npm run db:sync` in development to create tables, or import `database/schema.sql`.
