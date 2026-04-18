# Skovlyst CRM

## Filer
```
├── index.html       <- CRM-appen
├── package.json     <- Kræves af Vercel
├── vercel.json      <- Vercel routing
├── api/claude.js    <- Proxy (holder API-nøgle sikker)
```

## Deploy (5 min)

1. GitHub: opret repo, upload alle filer
2. Vercel: "Add New Project" → vælg repo → Deploy
3. Vercel → Settings → Environment Variables → tilføj ANTHROPIC_API_KEY
4. Redeploy → færdig!
