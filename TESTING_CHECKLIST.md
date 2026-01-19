# Prodsnap Testing Checklist

This document tracks critical test cases that must be verified before any production release.

## 1. Authentication & Security (Priority: Critical)
- [ ] **Homepage Protection**: 
  - Navigate to `https://prodsnap-gamma.vercel.app/` as a guest (incognito).
  - **Expected**: Immediate redirect to `/login`. User *must not* see the landing page.

- [ ] **Protected Routes (Direct Access via URL)**:
  - Attempt to access the following URLs directly without logging in (Check *ALL* tabs):
    - [x] `https://prodsnap-gamma.vercel.app/practice`
    - [x] `https://prodsnap-gamma.vercel.app/mentorship`
    - [x] `https://prodsnap-gamma.vercel.app/community`
    - [x] `https://prodsnap-gamma.vercel.app/blog`
    - [x] `https://prodsnap-gamma.vercel.app/contact`
    - [x] `https://prodsnap-gamma.vercel.app/prodsense` (Direct Link)
  - **Expected**: All must redirect immediately to `/login`. content must *never* flash or be visible.

- [ ] **Login UX & Performance**:
  - Enter valid credentials on `/login`.
  - **Expected (Immediate)**: "Sign In" button changes to "Redirecting..." state.
  - **Expected (Delayed >2s)**: If the server is slow, a full-screen "Securing your session..." overlay must appear.
  - **Expected (Result)**: User is successfully redirected to the Dashboard (`/`) without getting stuck in a loop.

## 2. Deployment Integrity
- [ ] **Production URL**: 
  - access `https://prodsnap-gamma.vercel.app` (or the live alias).
  - Verify it is serving the Next.js app (check for "Prodsnap" title), NOT the old Vite app.

## 3. User Session
- [ ] **Persistence**:
  - Login successfully.
  - Refresh the page.
  - **Expected**: User remains logged in.
  - Open a new tab.
  - **Expected**: User remains logged in.
