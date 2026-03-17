فريدج جينيس - Fridge Genius | by AM
  ═══════════════════════════════════════

  📁 frontend/
     └── index.html  ← الموقع كاملاً (HTML + CSS + JS)

  📁 backend/
     ├── src/routes/fridge.ts  ← AI (Gemini 2.5 Flash)
     ├── package.json
     └── tsconfig.json

  رفع الواجهة فقط (frontend):
  ─────────────────────────────
  ارفع index.html على أي استضافة (Netlify / Vercel / cPanel)

  تشغيل الـ Backend:
  ──────────────────
  1. cd backend && npm install
  2. أنشئ .env:
     GOOGLE_API_KEY=your_gemini_key_here
     PORT=8080
  3. npm run dev

  نموذج الذكاء الاصطناعي: gemini-2.5-flash
  