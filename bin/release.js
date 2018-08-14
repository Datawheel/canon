#! /usr/bin/env node

const execAsync = require("execAsync"),
      release = require("grizzly"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name, version} = JSON.parse(shell.cat("package.json"));

// shell.config.silent = true;

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
      repo: name,
      user: "datawheel",
      tag: `v${version}`,
      name: `v${version}`,
      body, prerelease
    }, error => {
      if (error) {
        shell.echo(`repo: ${name}`);
        shell.echo(`tag/name: v${version}`);
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
