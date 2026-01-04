# Story

A Next.js application with AI-powered speech and text capabilities.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

#### AI Provider
- `STORY_DEEPSEEK_API_KEY` - DeepSeek AI API key for chat functionality

#### Speech Services (at least one TTS and one STT provider required)

**Text-to-Speech (TTS) Providers:**
- `STORY_ELEVENLABS_API_KEY` - ElevenLabs API key for TTS
- `STORY_NEUPHONIC_API_KEY` - Neuphonic API key for TTS
- `STORY_KOKORO_URL` - Kokoro TTS service URL (default: `http://kokoro:8880`)

**Speech-to-Text (STT) Providers:**
- `STORY_WHISPER_URL` - Whisper STT service URL (default: `http://whisper:8000`)

### Optional Variables

- `NEXT_PUBLIC_STORY_APP_ENV` - Application environment (`staging`, `production`). Controls access to internal routes.

### Example .env.local

```bash
# AI Provider
STORY_DEEPSEEK_API_KEY=your_deepseek_api_key

# Text-to-Speech
STORY_ELEVENLABS_API_KEY=your_elevenlabs_api_key
STORY_NEUPHONIC_API_KEY=your_neuphonic_api_key
STORY_KOKORO_URL=http://localhost:8880

# Speech-to-Text
STORY_WHISPER_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_STORY_APP_ENV=staging
```

## Getting Started

Install dependencies using pnpm:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

Build for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Docker

Build and run with Docker:

```bash
# Build the image
docker build -t story .

# Run the container
docker run -p 3000:3000 --env-file .env.local story
```

The application is configured with Next.js standalone output for optimized Docker builds.

## Deployment

The project includes a GitHub Action workflow that automatically:
1. Builds and pushes Docker images to GitHub Container Registry (GHCR)
2. Updates the deployment manifest in `nori-cloud/lab` repository

### Workflow Jobs

**build-and-push**: Builds Docker image and pushes to GHCR
- Tags: `latest` and `<commit-sha>`

**update-deployment**: Updates Kubernetes deployment manifest
- Checks out `nori-cloud/lab` repository
- Updates `apps/story/deployment.yaml` with new image tag
- Commits and pushes changes

### Required Repository Secret

Create a GitHub Personal Access Token (PAT) with `repo` scope and add it as a repository secret:

- **Secret name**: `LAB_REPO_PAT`
- **Required permissions**: `repo` (to push to nori-cloud/lab)
- **How to create**: Settings → Developer settings → Personal access tokens → Generate new token

Pull the image:
```bash
docker pull ghcr.io/<owner>/<repo>:latest
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
