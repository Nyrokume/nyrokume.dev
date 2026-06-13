#!/usr/bin/env node
/**
 * Static export (GitHub Pages) cannot include Next.js API routes.
 * Temporarily moves app/api aside, builds, then restores for local dev.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, renameSync, rmSync } from "node:fs";

const API_DIR = "app/api";
const BACKUP_DIR = "app/_api_backup";

function moveApiAside() {
  if (!existsSync(API_DIR)) return;

  rmSync(BACKUP_DIR, { recursive: true, force: true });

  try {
    renameSync(API_DIR, BACKUP_DIR);
  } catch {
    cpSync(API_DIR, BACKUP_DIR, { recursive: true });
    rmSync(API_DIR, { recursive: true, force: true });
  }
}

function restoreApi() {
  if (!existsSync(BACKUP_DIR)) return;

  rmSync(API_DIR, { recursive: true, force: true });

  try {
    renameSync(BACKUP_DIR, API_DIR);
  } catch {
    cpSync(BACKUP_DIR, API_DIR, { recursive: true });
    rmSync(BACKUP_DIR, { recursive: true, force: true });
  }
}

moveApiAside();

const result = spawnSync("npx", ["cross-env", "GITHUB_PAGES=true", "next", "build"], {
  stdio: "inherit",
  shell: true,
});

restoreApi();
process.exit(result.status ?? 1);
