# Switching on AI checking and Ask a doubt

The app calls one Firebase function (`functions/index.js`, URL `https://asia-south1-coachyourward.cloudfunctions.net/ai`).
The function holds the API keys, picks the AI service and falls back to the next one if a service fails.
No key is ever inside the app, the website or GitHub.

## 1. Firebase: pay-as-you-go plan (once)
Firebase console → project **coachyourward** → Upgrade → **Blaze**. Add a budget alert (for example ₹200 a month).
At one student's volume the function stays inside the free allowance, so this should cost about ₹0.

## 2. Get at least one API key
Any one is enough. With more than one, the next is used automatically if the first fails.

| Service | Where | Default models (marking / doubts) |
|---|---|---|
| Claude (Anthropic) | console.anthropic.com → add credit, set a monthly limit, create a key | `claude-opus-5-5` / `claude-sonnet-5-5` |
| ChatGPT (OpenAI) | platform.openai.com → billing, limit, API keys | `gpt-5` / `gpt-5-mini` |
| Grok (xAI) | console.x.ai → billing, API keys | `grok-4` / `grok-4` |

Check the OpenAI and xAI model names on their pages; change them in step 4 if they differ.

## 3. Store the keys and deploy (on the laptop)
```
npm install -g firebase-tools
firebase login
cd functions && npm install && cd ..
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set XAI_API_KEY
firebase deploy --only functions
```
Each `secrets:set` asks for the value: paste the key, or type `none` for a service you don't use.
To add or change a key later, run its `secrets:set` again and then `firebase deploy --only functions`.

## 4. Settings (Firestore, no redeploy needed)
Firestore → collection `config` → document `ai`:

| Field | Type | Example | Meaning |
|---|---|---|---|
| `allowedEmails` | array of strings | `son@gmail.com` | **Required** (here or as `ALLOWED_EMAILS=a@gmail.com,b@gmail.com` in `functions/.env`, which is never committed). Only these Google accounts may use AI. |
| `order` | array of strings | `anthropic`, `openai`, `xai` | Which service to try first, second, third. |
| `dailyLimit` | number | `40` | Successful AI answers per student per day. Failed tries don't count. |
| `models` | map | `anthropic` → map `check: claude-sonnet-5-5` | Override a model for `check` (marking) or `doubt`. |

## Logs
Firestore `aiLog` has one document per request: who asked, which service answered, which ones failed and why.
`aiUsage` holds the daily counts.
