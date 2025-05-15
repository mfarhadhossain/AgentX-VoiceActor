# Clontract UI

## Overview
Next.js frontend for voice actors to upload contracts, highlight risky clauses, and get AI-powered negotiation tips.

## Tech Stack
- Next.js  
- Tailwind CSS  
- PDF.js viewer  
- REST API integration

## Installation & Run
```bash
git clone https://github.com/TanusreeSharma/AgentX-VoiceActor.git
cd client
npm install
npm run dev
````

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pages/      # Route handlers
app/        # (App Router)
components/ # UI components
public/     # Static assets
styles/     # Tailwind config
```

## Configuration

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=<api-url>
OPENAI_API_KEY=<key>
CLAUDE_API_KEY=<key>
```

## Features

* **Upload:** Drag-and-drop PDF contracts
* **Risk Summary:** Overall and “Voice-Use AI Risk” scores
* **Clause Details:** Clickable highlights with explanations
* **Negotiation Tips:** Suggested edits and talking points

## Contributing

1. Fork & branch (`feature/...`)
2. Commit & push
3. PR to `dev` branch

```
```
