# i

SvelteKit app with AI features (Gemini), Qdrant search, and tools like a YouTube video summarizer.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# start cloudflare worker
cd r; npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Environment variables

Place secrets in the appropriate SvelteKit env locations.

- GEMINI: Google API key for Gemini (used across features)
- GROQ: Groq API key for fast transcription (used by /api/transcribe)
- YOUTUBE_API_KEY: YouTube Data API v3 key (used by /api/youtube/search)

For local dev, you can add to .env (not committed):

```
GEMINI=your_gemini_api_key
GROQ=your_GROQ
YOUTUBE_API_KEY=your_youtube_api_key
```

SvelteKit reading conventions in this project:

- Server routes use $env/static/private or $env/dynamic/private
- We use $env/dynamic/private.env.YOUTUBE_API_KEY in /api/youtube/search

## New: YouTube Video Summarizer Tool

- UI: /tools/youtube-video-summarize-tool
- API:
  - POST /api/youtube/search
  - POST /api/youtube/transcript
  - POST /api/youtube/summarize
  - POST /api/youtube/chat

Add your keys and visit the page to use the tool.
