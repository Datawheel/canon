import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

class Contribution extends Component {

  render() {

    return (
      <div id="contribution">
        <h1>Commands Guide</h1>

        <h2><code className="bp3-code">pnpm i</code></h2>
        <p>Installs dependencies for all packages and this example site. Run it from root folder.</p>

        <h2><code className="bp3-code">pnpm run dev</code></h2>
        <p>Starts development server in your local machine in <code className="bp3-code">http://localhost:3300/</code></p>

        <h2><code className="bp3-code">pnpm add &#60;npm-package-name&#62; --filter=@datawheel/&#60;canon-package-name&#62;</code></h2>
        <p>Add a npm package as a new dependecy. ie. <code className="bp3-code">pnpm add lodash --filter=@datawheel/canon-cms</code>.</p>
        <p>If you run the command from the package folder, it detects the context and filter isn&rsquo;t necessary likewise, if you&rsquo;re on a package and want to install something on a different package, you have to use <code className="bp3-code">--filter</code></p>

        <h2><code className="bp3-code">pnpm run locales</code></h2>
        <p>This command collects any translatable string for you. It will search in your entire codebase for any component using the <code className="bp3-code">t( )</code> function. Translations are stored in JSON files in a <code className="bp3-code">locales/</code> folder in the root directory. See <a href="/docs/core-package/i18n">i18n</a> for more information.</p>

        <h2><code className="bp3-code">pnpm run build</code></h2>
        <p>Build the production ready files.</p>

        <h2><code className="bp3-code">pnpm run release &#60;package-name&#62;</code></h2>
        <p>Create a release of certain package. Remember that canon is a monorepo so you have to specify which package do you want to release a new version. ie. <code className="bp3-code">pnpm run release cms</code></p>

        <h2><code className="bp3-code">npm run start</code></h2>
        <p>Run built project and starts production server.</p>
      </div>
    );

  }
}

export default hot(Contribution);
