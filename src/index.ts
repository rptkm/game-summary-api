import { groq } from '@ai-sdk/groq';
import { serve } from '@hono/node-server';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// app.post('/api/generate-summary', async (c) => {
//   const body = await c.req.json();
//   const gameName = body.game;

//   return c.json({
//     ok: true,
//     message: `You requested information about: ${gameName}`,
//   })
// })









app.post('/api/generate-summary', async c => {
  const body = await c.req.json();
  const gameName = body.game;

  const { textStream } = streamText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that provides concise but informative summaries of video games. Focus on gameplay mechanics, genre, story overview, and what makes the game unique. Keep the summary under 200 words."
      },
      {
        role: "user",
        content: `Please provide me a summary of the game: ${gameName}`,
      }
    ]
  });

  return stream(c, async (stream) => {
    for await (const chunk of textStream) {
      await stream.write(chunk);
    }
  });
});

serve({ fetch: app.fetch, port: 8080 });