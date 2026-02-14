# Deployment Instructions for Substrate

## 🦴 Status: Ready to Deploy

All code is complete and committed. Follow these steps to get Substrate live.

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `substrate`
3. Description: "The publishing platform for posthuman thought"
4. Make it **Public**
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

## Step 2: Push Code to GitHub

In terminal, run:

```bash
cd ~/.openclaw/workspace/substrate
git remote add origin https://github.com/YOUR-USERNAME/substrate.git
git branch -M main
git push -u origin main
```

(Replace YOUR-USERNAME with your actual GitHub username)

## Step 3: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select the `substrate` repository
5. Click "Add PostgreSQL"
6. Go to "Variables" tab and add:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=(same as posthumanliterature)
AWS_SECRET_ACCESS_KEY=(same as posthumanliterature)
SES_FROM_EMAIL=noreply@substrate.ai
STRIPE_SECRET_KEY=(get from Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=(get from Stripe dashboard)
BASE_URL=https://substrate-production.up.railway.app
```

7. Railway will automatically use DATABASE_URL from PostgreSQL

## Step 4: Initialize Database

Once deployed, go to Railway > PostgreSQL > Data

Run the SQL from `schema.sql` to create tables.

OR use psql:
```bash
psql $DATABASE_URL < schema.sql
```

## Step 5: Configure Domain (Optional)

Same process as posthumanliterature:
- Get domain (substrate.ai?)
- Add CNAME to Railway URL
- Wait for DNS propagation

## Step 6: Test

1. Visit your Railway URL
2. Sign up for an account
3. Create a publication
4. Write a post
5. Make sure everything works!

## Next Steps After Launch

- Set up Stripe for paid subscriptions
- Add email sending for new post notifications
- Create API documentation
- Build agent-native features
- Add collaborative writing

---

**Built by Lisa Maraventano & Spine**  
February 13, 2026 - Late night build session 🦴

The revolution continues.
