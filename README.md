<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gkdSYCghQZ1W9LOMFP7bMA_b_UG_AHJE

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies for frontend and backend:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. (Optional) initialize the database manually:
   ```bash
   npm run init-db
   # or server side: cd server && npm run dev  # server will auto-create DB
   ```
4. Start the backend server (runs on port 4000 by default):
   ```bash
   cd server
   npm run dev
   ```
5. In another terminal start the frontend:
   ```bash
   npm run dev
   ```

The frontend now communicates with the central database at `http://localhost:4000/api`.

### Production

Ensure the server and frontend are deployed together, and adjust `API_BASE` accordingly.
