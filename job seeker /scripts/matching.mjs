import "dotenv/config";
import { runMatchingCycle } from "../src/lib/matching/pipeline.server.ts";

const result = await runMatchingCycle();
console.log(JSON.stringify(result, null, 2));

