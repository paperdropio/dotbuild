#!/usr/bin/env node

import { execSync } from "node:child_process";

// --- Action definitions ---

const ACTIONS = ["clean", "restore", "build", "run", "test"] as const;
type Action = (typeof ACTIONS)[number];

const ACTION_COMMANDS: Record<Action, string> = {
  clean: "dotnet clean",
  restore: "dotnet restore",
  build: "dotnet build",
  run: "dotnet run",
  test: "dotnet test",
};

// Canonical execution order
const ACTION_ORDER: Action[] = ["clean", "restore", "build", "run", "test"];

// Default when no args provided
const DEFAULT_ACTIONS: Action[] = ["clean", "restore", "build", "test"];

// --- Parsing ---

function parseActions(args: string[]): Action[] {
  if (args.length === 0) return [...DEFAULT_ACTIONS];

  const actions: Action[] = [];
  for (const arg of args) {
    const lower = arg.toLowerCase();
    if ((ACTIONS as readonly string[]).includes(lower)) {
      actions.push(lower as Action);
    } else {
      console.error(`Unknown action: ${arg}`);
      console.error(`Available actions: ${ACTIONS.join(", ")}`);
      process.exit(1);
    }
  }
  return actions;
}

// --- Ordering & optimization ---

function sortActions(actions: Action[]): Action[] {
  const unique = [...new Set(actions)];
  return unique.sort(
    (a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b),
  );
}

function optimizeActions(actions: Action[]): Action[] {
  const result = [...actions];

  // `dotnet test` already builds, so an explicit build is redundant
  if (result.includes("test") && result.includes("build")) {
    result.splice(result.indexOf("build"), 1);
  }

  return result;
}

// --- Execution ---

function execute(actions: Action[]): void {
  for (const action of actions) {
    const command = ACTION_COMMANDS[action];
    console.log(`\n> ${command}`);
    try {
      execSync(command, { stdio: "inherit" });
    } catch {
      console.error(`\nAction '${action}' failed. Stopping.`);
      process.exit(1);
    }
  }
}

// --- Main ---

function main(): void {
  const args = process.argv.slice(2);
  const parsed = parseActions(args);
  const sorted = sortActions(parsed);
  const optimized = optimizeActions(sorted);

  console.log(`dotbuild: ${optimized.join(" → ")}`);
  execute(optimized);
  console.log("\nAll actions completed successfully.");
}

main();
