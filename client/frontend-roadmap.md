# Frontend Roadmap (Odin Book)

## 1. Wire client ↔ server basics

- Decide API base URL (`http://localhost:9001`).
- Add `.env` in client: `VITE_API_URL=http://localhost:9001`.
- Create API helper (e.g. `src/lib/api.ts`) that uses `import.meta.env.VITE_API_URL` and wraps `fetch`/`axios` with JSON + error handling.

## 2. Set up routing + layout skeleton

- Install React Router and configure routes in `src/main.tsx` / `src/App.tsx`.
- Add routes that match Figma pages: `/login`, `/feed`, `/profile/:username`, `/friends`, `/settings`, etc.
- Create layout components (`AuthLayout`, `AppLayout`) with header/sidebar/content.
- Implement navigation (top bar, side nav) with placeholder page components.

## 3. Implement authentication flow (`/auth`)

- Inspect `auth` endpoints (login, register, logout, me, forgot/reset password).
- Build the "Welcome Back / Sign In" screen from Figma.
- Implement login form (username + password) calling backend login endpoint via API helper.
- Store auth state on success (context + localStorage/cookie as needed).
- Add "Forgot password?" and reset password pages if backend supports them.
- Implement "Continue as Guest" and demo account shortcuts.

## 4. Add protected route handling

- Create `AuthContext` (or similar) to hold current user, loading, `login`, `logout`, `refreshUser`.
- On app load, call `/auth/me` (or equivalent) to restore session.
- Implement `ProtectedRoute` so private pages redirect to `/login` if unauthenticated.
- Wire Sign Out to `/auth/logout` and clear auth state.

## 5. Build the main feed (`/post`)

- Inspect `post` endpoints (list, single, create, update, delete).
- On `/feed`, fetch posts on mount and show loading/empty states.
- Render posts to match Figma (avatar, username, time, text, images).
- Add "Create post" box that calls `POST /post` and updates feed.
- Optionally implement edit/delete for the post owner.

## 6. Implement likes and comments (`/like`, `/comment`)

- Inspect `like` and `comment` endpoints (add/remove like, list/add/delete comments).
- For each post, show like count and whether the current user liked it.
- Implement like/unlike actions and update UI state.
- Add comments list under posts or in a modal; fetch on expand.
- Implement add-comment form and optionally delete-own-comment.

## 7. Implement profiles and bios (`/bio`)

- Inspect `bio` routes to understand the schema and endpoints.
- Build `/profile/:username` page to show user info and bio.
- Display avatar, name, bio text, and optionally that users posts.
- Add "Edit profile" / "Edit bio" form that updates via `/bio` endpoints.

## 8. Implement friends and friend requests (`/friend`)

- Inspect `friend` routes (list friends, send request, accept/decline/cancel).
- Build `/friends` page showing current friends and pending requests.
- Wire actions for accept/decline/cancel friend requests.
- On profile pages, show stateful button: "Add friend" / "Request sent" / "Friends".

## 9. Polish UI to match Figma

- Define global styles (colors, typography, spacing) and apply via CSS or a design system.
- Extract reusable components: `Button`, `TextField`, `Card`, `Avatar`, `Modal`, etc.
- Ensure responsive layouts as needed (desktop first, then adjust for mobile/tablet).

## 10. Error, loading, and edge cases

- Standardize loading indicators (spinners/skeletons) and error messages.
- Handle auth expiry: on 401/403, clear auth state and redirect to `/login` with a message.
- Add basic client-side validation to forms (required fields, formats).

## 11. Dev + testing workflow

- Run backend (`npm run dev` or equivalent in `server/`) and frontend (`npm run dev` in `client/`) together.
- Optionally add UI tests (React Testing Library + Vitest) for key flows: login, posting, commenting, friend requests.
