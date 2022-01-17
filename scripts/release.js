#!/usr/bin/env node

/**
 * Run `node release.js <folder name>`
 */

const path = require("path");
const {Octokit} = require("@octokit/rest");
const shell = require("shelljs");
const execAsync = require("./execAsync");

const {
  GITHUB_TOKEN: token
} = process.env;

const target = process.argv[2];
module.exports = cliRelease(target);

/**
 * Executes the `release` subcommand for canon.
 * @param {string} folder
 */
async function cliRelease(folder) {
  const cwd = path.join("packages", folder);
  process.chdir(cwd);

  const packageManifest = shell.cat("./package.json").toString();
  const {name, version} = JSON.parse(packageManifest);

  let minor = version.split(".");
  const prerelease = parseFloat(minor[0]) === 0;
  minor = minor.slice(0, minor.length - 1).join(".");

  try {
    // get list of commits since last release
    const lastTag = await execAsync("git describe --tags --abbrev=0", {silent: true});
    const commitList = await execAsync(`git log --pretty=format:"* %s (%h)" ${lastTag.trim()}...HEAD`);
    const body = commitList.length ? commitList : `${name}@${version}`;

    // publish to npm
    await execAsync("npm publish --access public ./");
    shell.echo("published to npm");

    // commit the version bump
    await execAsync("git add --all");
    await execAsync(`git commit -m "compiles ${name}@${version}"`);
    shell.echo("git commit");

    // create git tag
    await execAsync(`git tag ${name}@${version}`);
    shell.echo("git tag");

    // push to origin
    await execAsync("git push origin --follow-tags");
    shell.echo("git push");

    const octokit = new Octokit({
      auth: `token ${token}`
    });

    // put the release on github
    await octokit.repos.createRelease({
      owner: "datawheel",
      repo: "canon",
      tag_name: `${name}@${version}`,
      name: `${name}@${version}`,
      body,
      prerelease
    }).catch(error => {
      shell.echo(`package: ${name}`);
      shell.echo(`version: ${version}`);
      shell.echo(`body: ${body}`);
      shell.echo(`prerelease: ${prerelease}`);
      shell.echo(error.message);
      shell.exit(1);
    });
    shell.echo("release pushed");

    shell.exit(0);
  }
  catch (e) {
    shell.echo(e);
    shell.exit(e.exitCode || 1);
  }
}
