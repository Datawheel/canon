#! /usr/bin/env node

const execAsync = require("./execAsync"),
      release = require("grizzly"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name, repository, version} = JSON.parse(shell.cat("package.json"));

// shell.config.silent = true;

const user = repository.url.split("github.com/")[1].split("/")[0];
const repo = repository.url.split("github.com/")[1].split("/")[1].split(".")[0];

let minor = version.split(".");
const prerelease = parseFloat(minor[0]) === 0;
minor = minor.slice(0, minor.length - 1).join(".");

let body = "";
execAsync("git log --pretty=format:'* %s (%h)' `git describe --tags --abbrev=0`...HEAD")
  .then(stdout => {
    body = stdout.length ? stdout : `v${version}`;
    return execAsync("npm publish ./");
  })
  .then(() => {
    shell.echo("published to npm");
    return execAsync("git add --all");
  })
  .then(() => execAsync(`git commit -m \"compiles v${version}\"`))
  .then(() => {
    shell.echo("git commit");
    return execAsync(`git tag v${version}`);
  })
  .then(() => execAsync("git push origin --follow-tags"))
  .then(() => {
    release(token, {
      user, repo,
      tag: `${name}@${version}`,
      name: `${name}@${version}`,
      body, prerelease
    }, error => {
      if (error) {
        shell.echo(`package: ${name}`);
        shell.echo(`version: ${version}`);
        shell.echo(`body: ${body}`);
        shell.echo(`prerelease: ${prerelease}`);
        shell.echo(error.message);
        shell.exit(1);
      }
      else {
        shell.echo("release pushed");
        shell.exit(0);

      }
    });
  })
  .catch(err => {
    shell.echo(err);
    shell.exit(1);
  });
