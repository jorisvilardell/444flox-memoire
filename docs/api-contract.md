# API contract — Carnet de bord

Base URL: `${API_URL}` (e.g. `http://localhost:3333`). All JSON, camelCase. Errors: `{ "errors": [{ "message": string, "field"?: string }] }` with proper status (400/401/404/413/422).

Auth: `Authorization: Bearer <token>` required on routes marked **admin**. Missing/invalid token: `401`.

## Entry

```ts
type EntryType = 'TEXTE' | 'RÉFÉRENCES' | 'CITATION' | 'INTERVIEW' | 'RESSOURCE'
type TextFormat = 'paragraph' | 'bullet' | 'numbered'

interface DialogueLine { spk: 'spk1' | 'spk2'; text: string }

interface EntryMeta {
  // RÉFÉRENCES
  apaRefArtist?: string; apaRefYear?: string; apaRefTitle?: string; apaRefSource?: string
  // CITATION
  apaCiteAuthor?: string; apaCiteYear?: string; apaCiteBook?: string; apaCitePublisher?: string; apaCitePage?: string
  // RESSOURCE
  apaResAuthor?: string; apaResDate?: string; apaResTitle?: string; apaResJournal?: string; apaResUrl?: string
  // INTERVIEW
  speaker1?: string; speaker2?: string; dialogue?: DialogueLine[]
}

interface Entry {
  id: string            // uuid
  title: string
  type: EntryType
  subtitle: string | null
  format: TextFormat     // default 'paragraph'
  content: string        // default ''
  image: string | null   // absolute URL or `/api/images/:id` path
  tags: string[]
  meta: EntryMeta
  position: number       // ascending = display order
  date: string           // 'DD/MM/YYYY' (entry date, defaults to creation day)
  createdAt: string      // ISO
  updatedAt: string      // ISO
}

// Body for create/update: every Entry field except id, position, createdAt, updatedAt.
// Only `title` and `type` are required on create. `date` optional ('DD/MM/YYYY').
type EntryInput = Partial<Omit<Entry, 'id' | 'position' | 'createdAt' | 'updatedAt'>> & { title: string; type: EntryType }
```

## Mémoire

A single long-form document, stored as a TipTap / ProseMirror JSON document. The API only checks the envelope (`type: 'doc'`, ≤ 2 MB serialized); the frontend editor schema decides what renders. Images inside it are `/api/images/:id` URLs from the upload route.

```ts
interface MemoireDoc { type: 'doc'; content?: unknown[] }
interface Memoire { content: MemoireDoc | null; updatedAt: string | null } // ISO
```

## Routes

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/health` | — | — | `{ status: 'ok' }` |
| POST | `/api/auth/login` | — | `{ password }` | `200 { token, expiresAt }` / `401` |
| GET | `/api/auth/me` | admin | — | `{ admin: true }` |
| POST | `/api/auth/logout` | admin | — | `204` |
| GET | `/api/entries` | — | — | `Entry[]` sorted by `position` asc |
| GET | `/api/entries/:id` | — | — | `Entry` / `404` |
| POST | `/api/entries` | admin | `EntryInput` | `201 Entry` (appended at end) |
| PUT | `/api/entries/:id` | admin | `EntryInput` | `200 Entry` |
| DELETE | `/api/entries/:id` | admin | — | `204` |
| PATCH | `/api/entries/:id/move` | admin | `{ direction: 'up' \| 'down' }` | `200 Entry[]` (full reordered list) |
| POST | `/api/images` | admin | multipart field `file` (image/*, ≤ 5 MB) | `201 { id, url }` where `url` = `/api/images/:id` |
| GET | `/api/images/:id` | — | — | binary, `Content-Type` from upload, `Cache-Control: public, max-age=31536000, immutable` |
| GET | `/api/memoire` | — | — | `Memoire` (`{ content: null, updatedAt: null }` before the first save) |
| PUT | `/api/memoire` | admin | `{ content: MemoireDoc }` | `200 Memoire` |

Image URLs returned as relative `/api/images/:id`: the frontend prefixes them with `API_URL`.
