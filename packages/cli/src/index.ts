#!/usr/bin/env node
import { Command } from "commander";
import { buildStaticFiles } from "./commands/build";
import { initProject } from "./commands/init";
import { scanUrl } from "./commands/scan";
import { scoreUrl } from "./commands/score";

const program = new Command();

program.name("agentnav").description("AgentNav command line tools").version("0.1.0");

program
  .command("init")
  .description("Create AgentNav config and Next.js metadata routes")
  .action(async () => {
    const files = await initProject();
    if (files.length === 0) {
      console.log("AgentNav files already exist.");
      return;
    }
    console.log(`Created ${files.length} files:`);
    files.forEach((file) => console.log(`- ${file}`));
  });

program
  .command("scan")
  .argument("<url>", "URL to scan")
  .description("Scan a page in a browser and output AgentPage JSON")
  .action(async (url: string) => {
    const page = await scanUrl(url);
    console.log(JSON.stringify(page, null, 2));
  });

program
  .command("score")
  .argument("<url>", "URL to score")
  .description("Scan and print the AgentNav readiness score")
  .action(async (url: string) => {
    console.log(await scoreUrl(url));
  });

program
  .command("build")
  .description("Generate static AgentNav files into public/")
  .action(async () => {
    const files = await buildStaticFiles();
    console.log(`Generated ${files.length} files:`);
    files.forEach((file) => console.log(`- ${file}`));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
