# Prism

AI creative studio — **image generation**, **video generation**, **prompt generation**, and a **creative co-pilot chatbot**.

Dark SaaS landing inspired by modern AI product templates.

## Run

```bash
npm install
npm run dev
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing |
| `/sign-in` | Sign in (Google or email) |
| `/sign-up` | Create account |
| `/projects` | Project library |
| `/new` | Create / generate script |
| `/project/[id]` | Workspace |
| `/project/[id]/gallery` | Gallery |
| `/settings` | Brand kit |

## API stubs

AI calls go through `src/lib/api-client.ts` and `/api/*` routes.
