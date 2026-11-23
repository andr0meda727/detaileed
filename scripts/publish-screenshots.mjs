#!/usr/bin/env node
/**
 * Publishes PNG screenshots for pull request descriptions to the orphan branch `screenshots` on origin, one folder
 * per task, and prints Markdown image links to paste into the PR body.
 *
 *   node scripts/publish-screenshots.mjs <folder> <file.png|directory>...
 *   node scripts/publish-screenshots.mjs t5 shots/t5-dashboard-bookings-dark-desktop.png
 *   node scripts/publish-screenshots.mjs baseline ./shots/baseline
 *
 * Files land at `<folder>/<file name>`; publishing a name again replaces it. It works only with git plumbing (a
 * temporary index, `commit-tree`, a push of the commit), so your checkout, index and branches are never touched.
 * The repo is public: publish mock data only.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const BRANCH = 'screenshots';
const ATTEMPTS = 5;

const usage = `Usage: node scripts/publish-screenshots.mjs <folder> <file.png|directory>...

Commits the PNGs to <folder>/ on the '${BRANCH}' branch of origin (created if missing) without touching your
checkout, and prints Markdown image links for the pull request body.

Example: node scripts/publish-screenshots.mjs t5 shots/dashboard-bookings-dark-desktop.png`;

const [folder, ...inputs] = process.argv.slice(2);
if (!folder || inputs.length === 0 || folder === '--help' || folder === '-h') {
  console.log(usage);
  process.exit(folder ? 0 : 1);
}
if (!/^[a-z0-9][a-z0-9._-]*$/i.test(folder)) {
  console.error(`The folder must be a simple name such as "t5" or "baseline", got "${folder}".`);
  process.exit(1);
}

const files = inputs.flatMap((input) =>
  statSync(input).isDirectory()
    ? readdirSync(input)
        .filter((name) => name.toLowerCase().endsWith('.png'))
        .sort()
        .map((name) => join(input, name))
    : [input],
);
const notPng = files.filter((file) => !file.toLowerCase().endsWith('.png'));
if (files.length === 0 || notPng.length > 0) {
  console.error(files.length === 0 ? 'No PNG files to publish.' : `Not PNG files: ${notPng.join(', ')}`);
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), 'publish-screenshots-'));
const env = { ...process.env, GIT_INDEX_FILE: join(tempDir, 'index') };
const git = (args, options = {}) =>
  execFileSync('git', args, { encoding: 'utf8', env, stdio: ['pipe', 'pipe', 'pipe'], ...options }).trim();

/** The tip of origin's screenshots branch, or null before the first publish. */
function remoteTip() {
  const line = git(['ls-remote', 'origin', `refs/heads/${BRANCH}`]);
  if (!line) return null;
  git(['fetch', '--quiet', '--no-tags', 'origin', BRANCH]);
  return git(['rev-parse', 'FETCH_HEAD']);
}

/** A commit with the files added on top of `parent` (or a first, parentless one). */
function buildCommit(parent, blobs) {
  rmSync(env.GIT_INDEX_FILE, { force: true });
  if (parent) git(['read-tree', parent]);
  for (const { blob, path } of blobs) git(['update-index', '--add', '--cacheinfo', `100644,${blob},${path}`]);
  const tree = git(['write-tree']);
  const message = `${folder}: ${blobs.length} screenshot${blobs.length === 1 ? '' : 's'}`;
  return git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', message]);
}

try {
  const blobs = files.map((file) => ({
    blob: git(['hash-object', '-w', file]),
    path: `${folder}/${basename(file)}`,
  }));
  let pushed = false;
  for (let attempt = 1; attempt <= ATTEMPTS && !pushed; attempt++) {
    const commit = buildCommit(remoteTip(), blobs);
    try {
      git(['push', '--quiet', 'origin', `${commit}:refs/heads/${BRANCH}`]);
      pushed = true;
    } catch (err) {
      // Someone else published in the meantime: build again on their commit.
      const output = `${err.stderr ?? ''}${err.stdout ?? ''}`;
      if (attempt === ATTEMPTS || !/non-fast-forward|fetch first|rejected|failed to update/i.test(output)) throw err;
      console.error(`The ${BRANCH} branch moved on, retrying (${attempt}/${ATTEMPTS - 1})…`);
    }
  }

  const repo = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], {
    encoding: 'utf8',
  }).trim();
  for (const { path } of blobs) {
    const alt = basename(path, '.png');
    console.log(`![${alt}](https://github.com/${repo}/blob/${BRANCH}/${path}?raw=true)`);
  }
} catch (err) {
  console.error(err.stderr?.toString() || err.message);
  process.exitCode = 1;
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
