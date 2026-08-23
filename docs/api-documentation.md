# API

## Public/Auth

POST /api/auth/register
POST /api/auth/login
POST /api/auth/admin-login

## Admin (Bearer token, ADMIN role)

GET /api/admin/me
GET /api/admin/dashboard
GET /api/admin/center-requests
GET /api/admin/center-requests/:id
PATCH /api/admin/center-requests/:id/decision
GET /api/admin/reports
