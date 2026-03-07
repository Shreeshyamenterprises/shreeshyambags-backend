# Shree Shyam Bags Backend

Backend API for the **Shree Shyam Bags** ecommerce platform.

This project powers:
- product management
- variant management
- cart
- orders
- admin APIs
- image uploads
- authentication

Built with:
- NestJS
- Prisma
- PostgreSQL
- Cloudinary
- JWT Auth

---

# 1. Project Overview

This backend is used for a custom **non-woven bags ecommerce platform**.

It supports:
- customer login and signup
- product listing
- product variants (size, color, shape)
- cart management
- checkout and orders
- admin product management
- image uploads for products

---

# 2. Tech Stack

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Cloudinary
- TypeScript

---

# 3. Clone the Repository

```bash
git clone https://github.com/Shreeshyamenterprises/shreeshyambags-backend.git
cd shreeshyambags-backend
```

If your NestJS app is inside the **api** folder:

```bash
cd api
```

---

# 4. Install Dependencies

```bash
npm install
```

---

# 5. Create Environment File

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/nonwoven_store
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3000
```

---

# 6. Setup Database

Make sure PostgreSQL is running and the database exists.

Example database name:

```
nonwoven_store
```

---

# 7. Prisma Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

If needed, give migration a name:

```bash
npx prisma migrate dev --name init
```

---

# 8. Run the Backend

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The server will run on:

```
http://localhost:3000
```

---

# 9. Useful Prisma Commands

Format schema:

```bash
npx prisma format
```

Open Prisma Studio:

```bash
npx prisma studio
```

Reset database:

```bash
npx prisma migrate reset
```

---

# 10. Main Features

## Auth
- user signup
- user login
- JWT authentication

## Products
- create product
- fetch all products
- fetch product by slug
- active/inactive product toggle

## Variants
- add variants to products
- update stock and price
- active/inactive toggle

## Cart
- add item to cart
- remove item from cart
- fetch current cart

## Orders
- place order
- fetch customer orders
- admin view orders

## Admin
- create products
- add variants
- upload product images
- edit variants
- activate/deactivate products

---

# 11. Image Uploads

Product images are uploaded using **Cloudinary**.

Make sure these values are correctly added to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

# 12. API Base URL

Local base URL:

```
http://localhost:3000
```

Example routes:

```
POST   /auth/signup
POST   /auth/login

GET    /products
GET    /products/:slug

GET    /cart
POST   /cart/items
DELETE /cart/items/:id

POST   /orders
GET    /orders/me

POST   /admin/products
GET    /admin/products
GET    /admin/products/:id
PATCH  /admin/products/:id

POST   /admin/products/:id/variants
PATCH  /admin/variants/:id
DELETE /admin/variants/:id

POST   /admin/products/:id/images
DELETE /admin/images/:id

GET    /admin/orders
```

---

# 13. Recommended Local Development Flow

### Step 1
Clone the repo:

```bash
git clone https://github.com/Shreeshyamenterprises/shreeshyambags-backend.git
cd shreeshyambags-backend
```

### Step 2
Install packages:

```bash
npm install
```

### Step 3
Create `.env`

### Step 4
Run Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

### Step 5
Start backend:

```bash
npm run start:dev
```

---

# 14. Common Issues

## Dependency error
Run:

```bash
npm install
```

## Prisma client error

```bash
npx prisma generate
```

## Migration error

```bash
npx prisma format
npx prisma migrate dev
```

## Port already in use

Change port in `.env`:

```env
PORT=3001
```

---

# 15. Git Setup

Clone repo:

```bash
git clone https://github.com/Shreeshyamenterprises/shreeshyambags-backend.git
```

Create new branch:

```bash
git checkout -b staging
```

Push changes:

```bash
git add .
git commit -m "your commit message"
git push origin staging
```

---

# 16. Suggested Branch Workflow

```
main → production
staging → testing environment
feature branches → development
```

Example:

```
feature/product-toggle
feature/admin-image-delete
staging
main
```

---

# 17. Environment Example File

Create `.env.example`:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/nonwoven_store
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3000
```

---

# 18. Notes

- Do not commit `.env`
- Do not commit `node_modules`
- Do not commit secrets
- Always run migrations before starting a fresh setup

---

# 19. License

Private project for **Shree Shyam Enterprises**.
