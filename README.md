# Chatty
This project enables you to run or deploy your own ChatGPT-like application.

### How it works
This app leverages [OpenAI](https://ai.com)'s recently released ChatGPT API with `gpt-3.5-turbo` model to respond to a chain of chat messages. Users submit messages to a [SvelteKit](https://kit.svelte.dev) API Endpoint/Request Handler, which relays the messages to the ChatGPT API. The responses are then proxied back to the client via SSE to stream the response in realtime.

### Built with
- Meta-Framework: [SvelteKit](https://kit.svelte.dev)
- Styles/Components: [TailwindCSS](https://tailwindcss.com) & [DaisyUI](https://daisyui.com)
- Deployment: [Vercel](https://vercel.com)


## Run Locally

Clone the repository
```sh
git clone https://github.com/huntabyte/chatty
```

Create a .env file within the new directory
```sh
cd chatty && touch .env
echo OPENAI_KEY=<YOUR_API_KEY_HERE> >> .env
```

Install dependencies & start the dev server
```sh
pnpm i && pnpm run dev
```

You can now access the dev server running at [localhost:5173](https://localhost:5173)

## Deploy to Vercel

Commit the repository to GitHub and select it when creating a new Vercel deployment.

Don't forget to set the `OPENAI_KEY` environment variable within your Vercel project settings.
