# Bunny media setup

Blindly uses Bunny Edge Storage and a connected Pull Zone for images, and Bunny Stream for video uploads and adaptive playback

## Image storage

Create a Bunny Storage Zone, connect it to a Pull Zone, then add these Production environment variables to the existing Vercel project

- `BUNNY_STORAGE_ZONE` — Storage Zone name
- `BUNNY_STORAGE_ACCESS_KEY` — password from Storage Zone → Access → API / HTTP
- `BUNNY_STORAGE_HOSTNAME` — regional API hostname shown in the Access page, for example `sg.storage.bunnycdn.com`
- `BUNNY_CDN_BASE_URL` — Pull Zone delivery URL, for example `https://blindly-media.b-cdn.net`

The access key stays server-side. Browsers upload to Blindly, which validates the image signature and checksum before forwarding the bytes to Bunny Storage

## Video storage

Create a Bunny Stream Video Library and add these Production environment variables to Vercel

- `BUNNY_STREAM_LIBRARY_ID` — numeric Video Library ID
- `BUNNY_STREAM_API_KEY` — API key from the library API settings

Blindly creates short-lived presigned TUS credentials on the server. The browser then uploads directly to Bunny Stream with resumable retries. The Stream API key is never returned to the browser

## Deployment

After adding or changing the variables, redeploy the latest Production deployment so Vercel functions receive the new configuration
