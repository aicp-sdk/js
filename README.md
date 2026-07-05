# AICP JavaScript SDK

The official JavaScript / TypeScript SDK for [AI Inference Control Plane](https://github.com/aicp-sdk) — a provider-agnostic LLM gateway that lets you route, monitor, and control inference requests across OpenAI, Anthropic, Google, and more.

## Installation

```bash
npm install @aicp/sdk
# or
yarn add @aicp/sdk
# or
pnpm add @aicp/sdk
```

Requires **Node.js 18+** (uses native `fetch`). Works in modern browsers too.

## Quick start

```typescript
import { AICPClient } from '@aicp/sdk';

const client = new AICPClient({
  apiKey: 'aicp-...',
  baseUrl: 'https://your-aicp-gateway',
});

const response = await client.chat.complete({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```

## Streaming

```typescript
for await (const chunk of client.chat.stream({
  model: 'claude-3-5-haiku-20241022',
  messages: [{ role: 'user', content: 'Tell me a story' }],
})) {
  process.stdout.write(chunk);
}
```

## Authentication

```typescript
const { token } = await client.auth.login({ email, password });
client.setApiKey(token);
```

## Documentation

Full SDK documentation: [aicp.dev/docs](https://aicp.dev/docs)

## License

MIT
