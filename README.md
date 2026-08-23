<<<<<<< HEAD
# -Market-Hub
=======
# Krest Center — FINAL INTEGRATED VERSION

Krest Center is a three-role marketplace with a public discovery homepage.

## Final user flow

Public visitor → Home → Search / scroll products & centers → Register / Login

Login automatically redirects by role:


## Final integration improvements


## Existing Part 3 database

If you already ran Parts 1, 2 and 3, **do not delete your database** and do not rerun the full schema.

Run these final integration migrations once, in order:

1. `database/migrations/008_final_auth_integration.sql`
2. `database/migrations/009_product_variants.sql`

From the final project folder:

```powershell
Copy-Item ..\krest-center-part3\.env .env
# Run database/migrations/008_final_auth_integration.sql, then database/migrations/009_product_variants.sql in MySQL Workbench
npm install
npm run audit
npm run dev
```

If your previous folder has another name, copy its `.env` manually.

## Fresh installation

1. Copy `.env.example` to `.env`.
2. Set your MySQL password and a strong JWT secret.
3. In MySQL Workbench run `database/schema.sql`.
4. Run `database/seed.sql`.
5. Then:

```powershell
npm install
npm run seed:admin
npm run seed:seller
npm run seed:buyer
npm run audit
npm run dev
```

Open `http://localhost:5000`.

## Demo accounts

### Admin
Uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` after `npm run seed:admin`.

Default `.env.example` values:


Change this password for real use.

### Seller

### Buyer

## Database migration history

For an old Part 1 database only, run in order:

1. `database/migrations/006_part2_seller.sql`
2. `database/migrations/007_part3_buyer.sql`
3. `database/migrations/008_final_auth_integration.sql`
4. `database/migrations/009_product_variants.sql`

Then seed demo accounts if wanted.

## Project audit

```powershell
npm run audit
```

The audit checks:


## Payment note

`COD`, `KBZPay Demo`, and `WavePay Demo` are demonstration payment choices. No real payment is processed.
>>>>>>> 6ffe152 (Prepare Market Hub for deployment)
