import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";

const app = createApp({ dbPath: process.env.WEIGHINGMS_DB });

await app.listen({ port, host });
console.log(`WeighingMS Dummy APIs http://${host}:${port}`);
console.log(`Operator HMI (Vite) http://127.0.0.1:5173  — npm run dev:web`);
