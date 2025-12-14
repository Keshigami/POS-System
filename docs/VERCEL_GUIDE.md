# 🚀 Vercel Deployment Guide

Since Vercel is a "serverless" platform, it cannot use the local `dev.db` (SQLite) file. We must switch to a Cloud Database (PostgreSQL).

## Step 1: Get a Free Cloud Database

We recommend **Supabase** or **Neon** (both have generous free tiers).

1. Go to [Supabase.com](https://supabase.com/) and create a free project.
2. Go to **Project Settings** -> **Database**.
3. Copy the **Connection String** (URI Mode). It looks like:
    `postgres://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

## Step 2: Deploy to Vercel

1. Push your latest code to GitHub.
2. Go to [Vercel.com](https://vercel.com/) and "Add New Project".
3. Import your `POS-System` repository.
4. **Environment Variables**: Add the following:
    * `DATABASE_URL`: Paste your Supabase connection string.
    * `NEXTAUTH_SECRET`: Generate a random string (e.g., `openssl rand -base64 32`).
    * `NEXTAUTH_URL`: Your Vercel URL (e.g., `https://pos-system.vercel.app`).
    * `GOOGLE_CLIENT_ID`: (Optional) From Google Cloud Console.
    * `GOOGLE_CLIENT_SECRET`: (Optional) From Google Cloud Console.

5. Click **Deploy**.

## Step 3: Initialize the Cloud Database

Once deployed, the database is empty. You need to push your schema and seed data.

### Option A: From your Local Machine (Easiest)

1. Update your local `.env` file with the *Cloud* `DATABASE_URL`.
2. Run:

    ```bash
    npx prisma db push
    npx tsx prisma/seed-ph-data.ts
    ```

### Option B: From Vercel Console

1. Go to Vercel Dashboard -> Storage -> Postgres (if using Vercel Postgres).
2. Or use the "Build Command" to include seeding (advanced).

## Step 4: Update Mobile App

Once your Vercel site is live (e.g., `https://my-pos.vercel.app`):

1. Open `capacitor.config.ts`.
2. Update the `server.url`:

    ```typescript
    server: {
      url: 'https://my-pos.vercel.app', // <--- Your new Vercel URL
      // ...
    }
    ```

3. Re-sync Android:

    ```bash
    npx cap copy
    npx cap open android
    ```

4. Build the APK in Android Studio!
