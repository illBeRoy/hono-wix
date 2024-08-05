import { Hono } from 'hono';

const app = new Hono();

const dynamicPath = () => `hello_${Math.random()}`;

app.get(dynamicPath());

export default app;
