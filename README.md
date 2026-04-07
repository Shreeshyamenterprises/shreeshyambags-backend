# Shree Shyam Bags — Backend API

NestJS REST API for the Shree Shyam Bags e-commerce platform. Handles authentication, product catalog, cart, orders (Razorpay), bulk quote requests, and image uploads (Cloudinary).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| Database | MongoDB Atlas (via Prisma ORM) |
| Auth | JWT + Google OAuth (Passport) |
| Payments | Razorpay |
| Images | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |

---

## Project Structure

```
api/
├── src/
│   ├── main.ts                  # App bootstrap, CORS, ValidationPipe
│   ├── app.module.ts            # Root module
│   ├── auth/                    # JWT + Google OAuth
│   ├── products/                # Public product catalog
│   ├── admin/                   # Admin-only management
│   ├── cart/                    # Shopping cart
│   ├── orders/                  # Orders + Razorpay payment
│   ├── quotes/                  # B2B bulk quote requests
│   ├── cloudinary/              # Image upload service
│   ├── prisma/                  # Database service
│   └── common/                  # Guards, decorators
├── prisma/
│   ├── schema.prisma            # MongoDB schema (13 models)
│   └── seed.ts                  # Database seeder
├── scripts/
│   └── create-admin.mjs         # Script to create admin user
└── render.yaml                  # Render deployment config
```

---

## API Endpoints

### Auth `/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | Public | Register new customer |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| GET | `/auth/me` | JWT | Get current user profile |
| PATCH | `/auth/me` | JWT | Update profile |
| GET | `/auth/google` | Public | Google OAuth login |
| GET | `/auth/google/callback` | Public | Google OAuth callback |

### Products `/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | List products with filters (search, size, color, shape) |
| GET | `/products/:slug` | Public | Get single product by slug |

### Cart `/cart`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | JWT | Get current user's cart |
| POST | `/cart/items` | JWT | Add item to cart |
| PATCH | `/cart/items/:id` | JWT | Update item quantity |
| DELETE | `/cart/items/:id` | JWT | Remove item |
| DELETE | `/cart` | JWT | Clear entire cart |

### Orders `/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | JWT | Create Razorpay order |
| POST | `/orders/verify` | JWT | Verify payment signature |
| GET | `/orders/me` | JWT | Get user's orders |
| GET | `/orders/:id` | JWT | Get single order |

### Quotes `/quotes`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/quotes` | Public | Submit bulk quote request |
| POST | `/quotes/contact` | Public | Submit contact inquiry |
| GET | `/quotes` | Admin | List all quotes |
| PATCH | `/quotes/:id` | Admin | Update quote status/response |

### Admin `/admin`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admin/products` | Admin | Create product |
| GET | `/admin/products` | Admin | List all products |
| PATCH | `/admin/products/:id` | Admin | Update product |
| DELETE | `/admin/products/:id` | Admin | Delete product |
| POST | `/admin/products/:id/variants` | Admin | Add variant |
| PATCH | `/admin/variants/:id` | Admin | Update variant |
| DELETE | `/admin/variants/:id` | Admin | Delete variant |
| POST | `/admin/products/:id/images` | Admin | Upload image |
| DELETE | `/admin/images/:id` | Admin | Delete image |
| GET | `/admin/orders` | Admin | List all orders |
| GET | `/admin/quotes` | Admin | List all quotes |
| PATCH | `/admin/quotes/:id` | Admin | Respond to quote |

---

## Database Models

| Model | Description |
|-------|-------------|
| `User` | Customers and admin accounts (role: CUSTOMER / ADMIN) |
| `Product` | Top-level catalog entries (title, slug, description, basePrice) |
| `Variant` | Size / color / shape SKUs with price, stock, GSM |
| `ProductImage` | Cloudinary image URLs per product |
| `PricingTier` | Bulk kg price slabs per variant |
| `CartItem` | User shopping cart |
| `Order` | Razorpay orders with shipping snapshot |
| `OrderItem` | Line items snapshotted at purchase time |
| `QuoteRequest` | B2B bulk enquiries |

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 20+
- npm
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)
- A [Razorpay](https://razorpay.com) account (test mode works)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Shreeshyamenterprises/shreeshyambags-backend.git
cd shreeshyambags-backend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

Create a `.env` file in the project root:

```env
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nonwoven_store?retryWrites=true&w=majority"

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_strong_random_secret"

PORT=3000

# Razorpay (use test keys from razorpay.com dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxx

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (optional — from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# Gmail SMTP (use an App Password, not your main password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

### Step 4 — Generate Prisma client

```bash
npx prisma generate
```

### Step 5 — (Optional) Seed the database with sample data

```bash
npm run seed
```

### Step 6 — Create your first admin user

```bash
node scripts/create-admin.mjs admin@yourdomain.com YourPassword123
```

> Default credentials (if no arguments given): `admin@piebags.com` / `Admin@1234`

### Step 7 — Start the development server

```bash
npm run start:dev
```

API will be running at `http://localhost:3000`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload (development) |
| `npm run start:prod` | Run compiled production build |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

---

## Deployment (Render — Free Tier)

### Step 1 — Push to GitHub
Make sure your code is pushed to the `main` branch.

### Step 2 — Create a Web Service on Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo `shreeshyambags-backend`
3. Render will auto-detect `render.yaml`

### Step 3 — Add environment variables
In Render dashboard → **Environment**, add all the variables from your `.env` file.
Set `FRONTEND_URL` and `ADMIN_URL` to your actual Netlify URLs.

### Step 4 — Allow Render IPs in MongoDB Atlas
MongoDB Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)

### Step 5 — Deploy
Click **Manual Deploy** — your API will be live at `https://your-service.onrender.com`

**Build command used by Render:**
```
npm install --include=dev && npx prisma generate && npm run build
```

**Start command:**
```
npm run start:prod
```

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production — deploys to Render automatically |
| `staging` | Staging — test here before merging to main |

### Recommended workflow
```
# Work on staging
git checkout staging
# make your changes
git add . && git commit -m "your change"
git push origin staging

# When ready for production
git checkout main
git merge staging
git push origin main
```
