# AIDA Mobile

Expo app for iOS and Android using the same Supabase database and Next.js API backend as the website.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_API_BASE_URL`

## Run

```bash
npm install
npm run start
```

Then open in Expo Go for iOS or Android.

## Included flows

- Email/password auth
- Projects list + create project
- Project hub
- Generate meme
- Gallery
- Characters + pose upload from phone
- Members + invitations
- Personal wallet + project wallet

## Notes

- Mobile calls AI and collaboration APIs with `Authorization: Bearer <token>`
- Website and app share the same database and storage buckets
- Admin stays on web only

## App Store Metadata/Screenshots

- Prepared metadata: `fastlane/metadata/en-US` and `fastlane/metadata/vi`
- Prepared iPhone screenshots (6.5"): `fastlane/screenshots/en-US` and `fastlane/screenshots/vi`

Upload commands:

```bash
FASTLANE_USER="your-apple-id@example.com" fastlane ios upload_metadata
FASTLANE_USER="your-apple-id@example.com" fastlane ios upload_screenshots
```
