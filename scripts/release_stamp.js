#!/usr/bin/env node
/**
 * Stamp CHANGELOG.md and bump version.txt, marketplace.json, and plugin.json manifests.
 *
 * Usage:
 *     node scripts/release_stamp.js --bump minor --author @username
 *     node scripts/release_stamp.js --dry-run
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getGitUser() {
  try {
    return execSync("git log -1 --pretty=format:%an").toString().trim() || "unknown";
  } catch (e) {
    return "unknown";
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    bump: "minor",
    author: null,
    date: null,
    dryRun: false,
    versionFile: "version.txt",
    changelogFile: "CHANGELOG.md",
    marketplaceFile: ".claude-plugin/marketplace.json",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--bump") parsed.bump = args[++i];
    else if (arg === "--author") parsed.author = args[++i];
    else if (arg === "--date") parsed.date = args[++i];
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--version-file") parsed.versionFile = args[++i];
    else if (arg === "--changelog-file") parsed.changelogFile = args[++i];
    else if (arg === "--marketplace-file") parsed.marketplaceFile = args[++i];
  }

  if (!["major", "minor", "patch"].includes(parsed.bump)) {
    parsed.bump = "minor";
  }
  return parsed;
}

function main() {
  const args = parseArgs();

  const versionPath = path.resolve(args.versionFile);
  if (!fs.existsSync(versionPath)) {
    console.error(`ERROR: ${versionPath} not found`);
    process.exit(1);
  }

  const current = fs.readFileSync(versionPath, "utf-8").trim();
  const baseVersion = current.replace("-SNAPSHOT", "");
  const parts = baseVersion.split(".");
  if (parts.length !== 3 || parts.some(isNaN)) {
    console.error(`ERROR: invalid semver format (got: ${baseVersion})`);
    process.exit(1);
  }

  let [major, minor, patch] = parts.map(Number);
  if (args.bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (args.bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  const release = `${major}.${minor}.${patch}`;
  const author = args.author || getGitUser();
  const date = args.date || new Date().toISOString().split("T")[0];

  console.log("=== Release Stamp ===");
  console.log(`  Current:  ${current}`);
  console.log(`  Release:  ${release}`);
  console.log(`  Bump:     ${args.bump}`);
  console.log(`  Author:   ${author}`);
  console.log(`  Date:     ${date}`);

  if (args.dryRun) {
    console.log("\n[DRY RUN] No files modified.");
    return;
  }

  const changelogPath = path.resolve(args.changelogFile);
  if (!fs.existsSync(changelogPath)) {
    console.error(`ERROR: ${changelogPath} not found`);
    process.exit(1);
  }

  let content = fs.readFileSync(changelogPath, "utf-8");
  const unreleasedMarker = "## [Unreleased]";
  const releasedMarker = "## [Released]";
  const unreleasedIdx = content.indexOf(unreleasedMarker);
  const releasedIdx = content.indexOf(releasedMarker);

  if (unreleasedIdx === -1 || releasedIdx === -1) {
    console.error("ERROR: CHANGELOG.md must contain '## [Unreleased]' and '## [Released]'");
    process.exit(1);
  }

  const unreleasedEnd = unreleasedIdx + unreleasedMarker.length;
  let entries = content.slice(unreleasedEnd, releasedIdx).trim();
  if (!entries) {
    entries = "- No updates for this version";
  }

  const beforeUnreleased = content.slice(0, unreleasedIdx);
  const afterReleased = content.slice(releasedIdx + releasedMarker.length).replace(/^\s+/, "");
  content = `${beforeUnreleased}${unreleasedMarker}\n\n${releasedMarker}\n\n## [${release}] — ${date} (${author})\n\n${entries}\n\n${afterReleased}`;
  fs.writeFileSync(changelogPath, content);

  fs.writeFileSync(versionPath, `${release}\n`);

  const marketplacePath = path.resolve(args.marketplaceFile);
  if (fs.existsSync(marketplacePath)) {
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf-8"));
    for (const plugin of marketplace.plugins || []) {
      plugin.version = release;
      if (plugin.source) {
        const pluginManifestPath = path.resolve(plugin.source, ".claude-plugin", "plugin.json");
        if (fs.existsSync(pluginManifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(pluginManifestPath, "utf-8"));
          manifest.version = release;
          fs.writeFileSync(pluginManifestPath, JSON.stringify(manifest, null, 2) + "\n");
          console.log(`✅ ${path.relative(process.cwd(), pluginManifestPath)} bumped to ${release}`);
        }
      }
    }
    fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + "\n");
    console.log(`✅ ${args.marketplaceFile} bumped to ${release}`);
  }

  console.log(`\n✅ Version bumped to ${release} and CHANGELOG.md stamped.`);
}

main();
