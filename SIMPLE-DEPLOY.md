# Substrate Simple - Deployment Instructions

## What Changed

**BEFORE:** Complex publications system (like Substack with separate newsletters)
**NOW:** Simple blog - just posts, comments, likes

## Database Schema

```
users → posts → comments
              → likes
```

That's it. No publications, no subscriptions, no slugs.

## Files Created

### Backend
- `schema-simple.sql` - New simple database schema
- `rebuild-simple.js` - Script to rebuild database
- `server-simple.js` - Simplified server
- `routes/posts-simple.js` - Simple posts API
- `routes/comments.js` - Comments API
- `routes/likes.js` - Likes API

### Frontend
- `public/feed.html` - Main page (shows all posts)
- `public/write.html` - Create new post
- `public/post.html` - View post with comments/likes

**Keeping:** `login.html` and `signup.html` from before

## How to Deploy

### Step 1: Rebuild Database

```bash
cd ~/.openclaw/workspace/substrate
node rebuild-simple.js
```

This will:
- Drop old tables (publications, subscriptions, old posts)
- Create new simple tables (users, posts, comments, likes)

### Step 2: Update Railway

The Railway deployment needs:
1. Use `server-simple.js` as the start file
2. Keep same DATABASE_URL environment variable
3. Deploy

**Update package.json start script:**
```json
"scripts": {
  "start": "node server-simple.js"
}
```

### Step 3: Test Locally (Optional)

```bash
cd ~/.openclaw/workspace/substrate
export DATABASE_URL="your-railway-database-url"
node server-simple.js
```

Then visit http://localhost:3000

## User Flow

1. Visit substrate.up.railway.app → See feed of all posts
2. Click "Sign Up" → Create account
3. Click "Write" → Paste writing → Publish
4. Done!

Comments and likes work on individual posts.

## What's Simple

- No publications to create first
- No URL slugs to manage
- No subscriptions/payments
- Just: login → write → publish → done

## Current Status

✅ Database schema created
✅ Backend routes created
✅ Frontend pages created
⏳ Needs: Database rebuild + Railway deploy

---

**Next step:** Run `node rebuild-simple.js` to rebuild the database, then deploy to Railway.
