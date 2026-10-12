import { generateAndPublishSeoArticle } from "../src/lib/aiContentGenerator";

async function main() {
  console.log("Starting autonomous AI article generation & publishing...");
  const result = await generateAndPublishSeoArticle();
  console.log("PUBLISH RESULT:", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
