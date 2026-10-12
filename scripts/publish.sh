#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
task_root="$PWD"
repo="${GITHUB_REPOSITORY:-Bojan-Ivanovski/heral-metal}"
mkdir -p test-results

# This helper runs in a terminal with browser and network access.
npm run verify | tee test-results/validation.log
npm run test:browser | tee test-results/browser.log
npm run test:performance | tee test-results/performance.log
node --input-type=module <<'JS'
import { readFile, writeFile } from 'node:fs/promises';
const browser = JSON.parse(await readFile('test-results/browser-qa.json', 'utf8'));
const performance = JSON.parse(await readFile('test-results/performance-summary.json', 'utf8'));
if (!browser.completed || browser.layoutFailures.length || browser.violations.length) throw new Error('Browser verification did not pass');
const table = performance.map(row => `| ${row.route} | ${row.scores.performance} | ${row.scores.accessibility} | ${row.scores['best-practices']} | ${row.scores.seo} |`).join('\n');
let record = await readFile('docs/verification.md', 'utf8');
record = record.split('## Completed browser verification')[0].trim();
record = record.replace('- Browser startup and localhost listening are blocked inside the workspace sandbox (`Operation not permitted`). Browser and Lighthouse suites are prepared for execution from a normal terminal and GitHub Actions; no successful full-suite result is claimed yet.\n', '').replace('- The first user-run browser check flagged 320px text geometry. The measurement was refined to exclude decorative pseudo-elements and to collect screenshots and results across the entire viewport matrix. The refined suite is awaiting a complete run.\n', '');
record += `\n\n## Completed browser verification\n\nExecuted outside the sandbox on ${new Date().toISOString().slice(0,10)} using the production build.\n\n- ${browser.overflowChecks} layout checks: all 20 routes at 320, 375, 430, 768, 1024, 1280, 1440, 1920, 2560 and 3440px. No horizontal overflow, clipped text or broken images.\n- ${browser.accessibilityChecks} axe checks at 375 and 1440px: no automated WCAG A/AA violations.\n- ${browser.functional.join('\n- ')}\n- No browser runtime errors or failed local resources.\n- Screenshots of all three designed pages and added Services/Projects at 375, 1440 and 3440px were captured for review.\n\n### Lighthouse mobile results\n\n| Route | Performance | Accessibility | Best practices | SEO |\n|---|---:|---:|---:|---:|\n${table}\n\nScores describe this run, not a guarantee under all networks and devices. Actual Web3Forms delivery is not exercised by mocked browser tests.\n`;
await writeFile('docs/verification.md', record);
JS

gh api user --jq .login
gh repo view "$repo" --json nameWithOwner,isPrivate
test "$(gh repo view "$repo" --json isPrivate --jq .isPrivate)" = false
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init --initial-branch=main
  if [ -d /tmp/heral-metal.git ]; then
    git fetch /tmp/heral-metal.git main
    git reset --mixed FETCH_HEAD
  fi
fi
test "$(git rev-parse --show-toplevel)" = "$task_root"
git config user.name 'Bojan Ivanovski'
git config user.email '134221739+Bojan-Ivanovski@users.noreply.github.com'
git config credential.https://github.com.helper '!gh auth git-credential'
if git remote get-url origin >/dev/null 2>&1; then
  test "$(git remote get-url origin)" = "https://github.com/$repo.git"
else
  git remote add origin "https://github.com/$repo.git"
fi
git add .
if ! git diff --cached --quiet; then git commit -m 'Verify responsive layouts and publish Heral Metal website'; fi
git branch -M main
git push -u origin main
head_sha="$(git rev-parse HEAD)"
if gh api "repos/$repo/pages" >/dev/null 2>&1; then
  gh api "repos/$repo/pages" --method PUT -f build_type=workflow >/dev/null
else
  gh api "repos/$repo/pages" --method POST -f build_type=workflow >/dev/null
fi
run_id=''
for attempt in {1..20}; do
  run_id="$(gh run list --repo "$repo" --branch main --workflow deploy.yml --limit 10 --json databaseId,headSha --jq "[.[] | select(.headSha == \"$head_sha\")][0].databaseId // empty")"
  if [ -n "$run_id" ]; then break; fi
  sleep 3
done
if [ -z "$run_id" ]; then printf 'No workflow run appeared yet. Check Actions.\n'; exit 1; fi
watch_status=0
gh run watch "$run_id" --repo "$repo" --exit-status | tee test-results/deployment.log || watch_status=$?
gh run view "$run_id" --repo "$repo" --json status,conclusion,url,headSha,jobs > test-results/deployment-result.json
test "$watch_status" -eq 0
node scripts/live-check.mjs
git rev-parse HEAD | tee test-results/final-commit.txt
