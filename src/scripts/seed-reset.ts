import { ensureSchema } from "./ensure-schema";
import { seed } from "./seed";

async function main() {
  ensureSchema();
  await seed({ reset: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
