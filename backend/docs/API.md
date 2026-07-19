# API Documentation — Tinubu Support Bauchi 2027

Base URL: `/api`
Content-Type: `application/json`
Auth: `Authorization: Bearer <JWT>`

## Roles

`super_admin`, `admin`, `membership_officer`, `corporate_officer`, `editor`, `member`, `corporate_user`

---

## Auth — `/api/auth`

| Method | Path                  | Auth | Body                                |
|--------|-----------------------|------|-------------------------------------|
| POST   | /register             | -    | name, email, phone?, password, role?|
| POST   | /login                | -    | email, password                     |
| POST   | /logout               | JWT  | -                                   |
| GET    | /me                   | JWT  | -                                   |
| PUT    | /me                   | JWT  | name?, phone?, password?             |
| POST   | /forgot-password      | -    | email                               |
| POST   | /reset-password       | -    | token, password                     |

## Members — `/api/members`

| Method | Path                       | Auth | Notes                          |
|--------|----------------------------|------|--------------------------------|
| POST   | /register                  | -    | multipart: passportPhoto        |
| GET    | /profile                   | JWT  | own profile                    |
| PUT    | /profile                   | JWT  | multipart: passportPhoto        |
| GET    | /card                      | JWT  | PDF download (after approval)   |
| GET    | /verify/:membershipNumber  | -    | public; no sensitive data       |

## Corporate — `/api/corporate`

| Method | Path          | Auth | Notes                                       |
|--------|---------------|------|---------------------------------------------|
| POST   | /register     | -    | multipart: organizationLogo, supportingDocuments|
| GET    | /profile      | JWT  | own profile                                  |
| PUT    | /profile      | JWT  | multipart: organizationLogo                  |
| GET    | /certificate  | JWT  | PDF download (after approval)                |

## Blog — `/api/blog`

| Method | Path           | Auth   | Notes                       |
|--------|----------------|--------|-----------------------------|
| GET    | /              | -      | ?page&limit&search&category&tag |
| GET    | /categories    | -      | list categories             |
| GET    | /:slug         | -      | single published post        |
| GET    | /admin/list    | editor | all posts (any status)       |
| POST   | /              | editor | multipart: featuredImage     |
| POST   | /categories    | editor | create category              |
| PUT    | /:id           | editor | multipart: featuredImage     |
| DELETE | /:id           | editor | delete post                  |

## Events — `/api/events`

| Method | Path          | Auth  | Notes                          |
|--------|---------------|-------|--------------------------------|
| GET    | /             | -     | ?page&limit&status&search       |
| GET    | /:slug        | -     | single event                    |
| GET    | /admin/list   | admin | all events                      |
| POST   | /             | admin | multipart: featuredImage        |
| PUT    | /:id          | admin | multipart: featuredImage        |
| DELETE | /:id          | admin | delete event                    |

## Leadership — `/api/leadership`

| Method | Path          | Auth  | Notes                  |
|--------|---------------|-------|------------------------|
| GET    | /             | -     | active leaders         |
| GET    | /admin/list   | admin | all leaders            |
| POST   | /             | admin | multipart: photo        |
| PUT    | /:id          | admin | multipart: photo        |
| DELETE | /:id          | admin | delete leader           |

## Contact — `/api/contact`

| Method | Path | Auth | Body                                   |
|--------|------|------|----------------------------------------|
| POST   | /    | -    | name, email, phone?, subject?, message  |

## Newsletter — `/api/newsletter`

| Method | Path          | Auth | Body/Query       |
|--------|---------------|------|------------------|
| POST   | /subscribe    | -    | email             |
| GET    | /unsubscribe | -    | ?token=           |

## Notifications — `/api/notifications` (auth required)

| Method | Path        | Notes                          |
|--------|-------------|--------------------------------|
| GET    | /           | ?page&limit&unread=1             |
| PUT    | /read-all   | mark all as read                |
| PUT    | /:id/read   | mark one as read                |
| DELETE | /:id        | delete                          |

## Admin — `/api/admin` (staff only)

| Method | Path                                  | Role               |
|--------|---------------------------------------|--------------------|
| GET    | /dashboard                            | staff              |
| GET    | /members                              | membership_officer |
| GET    | /members/:id                          | membership_officer |
| PUT    | /members/:id/approve                  | membership_officer |
| PUT    | /members/:id/reject                   | membership_officer |
| PUT    | /members/:id/suspend                  | membership_officer |
| GET    | /corporates                           | corporate_officer  |
| GET    | /corporates/:id                       | corporate_officer  |
| PUT    | /corporates/:id/approve               | corporate_officer  |
| PUT    | /corporates/:id/reject                | corporate_officer  |
| GET    | /messages                             | staff              |
| PUT    | /messages/:id                         | staff              |
| DELETE | /messages/:id                         | staff              |
| GET    | /subscribers                          | staff              |
| DELETE | /subscribers/:id                      | staff              |
| GET    | /users                               | admin              |
| PUT    | /users/:id                           | admin              |
| POST   | /notifications                       | admin              |
| GET    | /logs                               | admin              |

## Response envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "errors": [ { "field": "...", "message": "..." } ] }
```

## Status codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests
- 500 Internal Server Error
