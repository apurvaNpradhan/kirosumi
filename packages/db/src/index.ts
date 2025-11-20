import { env } from "cloudflare:workers";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, {
	schema,
});
