#!/usr/bin/env node
/**
 * Scans project files for leaked API keys before git push / build.
 * .env.local is never scanned (gitignored); only tracked/source files.
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  "out",
  "build",
  ".git",
  ".vercel",
]);

const IGNORE_FILES = new Set([
  ".env.local",
  ".env",
  ".env.production",
  ".env.development",
  ".env.example",
]);

const SECRET_PATTERNS = [
  { name: "Google/Gemini API key", regex: /AIza[0-9A-Za-z\-_]{20,}/ },
  { name: "Groq API key", regex: /gsk_[0-9A-Za-z]{20,}/ },
  { name: "OpenRouter API key", regex: /sk-or-v1-[0-9a-f]{20,}/ },
  { name: "Generic secret assignment", regex: /(?:API_KEY|SECRET|TOKEN)\s*=\s*['"]?[a-zA-Z0-9_\-]{24,}/ },
];

const PUBLIC_ENV_PATTERN = /NEXT_PUBLIC_.*(?:KEY|SECRET|TOKEN)/;

function getGitFiles() {
  try {
    const output = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" });
    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((file) => !IGNORE_FILES.has(file));
  } catch {
    return null;
  }
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;

    const fullPath = join(dir, entry);
    const rel = relative(ROOT, fullPath);

    if (IGNORE_FILES.has(rel)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (stat.isFile() && stat.size < 512_000) {
      files.push(rel);
    }
  }

  return files;
}

function scanFile(filePath) {
  let content;
  try {
    content = readFileSync(join(ROOT, filePath), "utf8");
  } catch {
    return [];
  }

  const hits = [];

  for (const { name, regex } of SECRET_PATTERNS) {
    if (regex.test(content)) {
      hits.push({ file: filePath, rule: name });
    }
  }

  if (PUBLIC_ENV_PATTERN.test(content) && !filePath.includes("check-secrets")) {
    hits.push({
      file: filePath,
      rule: "NEXT_PUBLIC_* with KEY/SECRET/TOKEN — never expose secrets to the browser",
    });
  }

  return hits;
}

const files = getGitFiles() ?? walk(ROOT);
const findings = files.flatMap(scanFile);

if (findings.length > 0) {
  console.error("\n❌ Possible secrets detected:\n");
  for (const hit of findings) {
    console.error(`  • ${hit.file} — ${hit.rule}`);
  }
  console.error("\nRemove secrets before pushing to GitHub.");
  console.error(".env.local must stay local only (see .gitignore).\n");
  process.exit(1);
}

console.log("✓ No secrets found in tracked/source files.");
