#! /usr/bin/env node

const release = require("grizzly"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name, version} = JSON.parse(shell.cat("package.json"));

// shell.config.silent = true;

let minor = version.split(".");
const prerelease = parseFloat(minor[0]) === 0;
minor = minor.slice(0, minor.length - 1).join(".");

function kill(code, stdout) {
  shell.echo(stdout);
  shell.exit(code);
}

shell.exec("npm run compile", (code, stdout) => {
  if (code) kill(code, stdout);
  shell.echo("code compiled");

  shell.exec("git log --pretty=format:'* %s (%h)' `git describe --tags --abbrev=0`...HEAD", (code, stdout) => {
    const body = stdout.length ? stdout : `v${version}`;

    shell.exec("npm publish ./", (code, stdout) => {
      if (code) kill(code, stdout);
      shell.echo("published to npm");

      shell.exec("git add --all", (code, stdout) => {
        if (code) kill(code, stdout);

        shell.exec(`git commit -m \"compiles v${version}\"`, (code, stdout) => {
          if (code) kill(code, stdout);
          shell.echo("git commit");

          shell.exec(`git tag v${version}`, (code, stdout) => {
            if (code) kill(code, stdout);

            shell.exec("git push origin --follow-tags", (code, stdout) => {
              if (code) kill(code, stdout);

              release(token, {
                repo: name,
                user: "d3plus",
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

            });

          });

        });

      });

    });

  });

});
