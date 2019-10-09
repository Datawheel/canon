# Contributing

## Creating a Plugin

Canon is a monorepo, with plugins stored in the `packages/` folder. To get started creating a new plugin:

1. Create a new branch to work in (usually `<name>-0.1`).
2. Create a new subfolder `packages/<name>`
3. Initialize a `package.json` and add `@datawheel/canon-core` to both the devDependencies and the peerDependencies
4. Run `npx canon-setup` to create a boilerplate canon site to test your plugin (these files will not get published to npm).
5. Create a `src/` folder to store your code!
