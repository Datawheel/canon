import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

class Contribution extends Component {

  render() {

    return (
      <div id="contribution">
        <h1>Contribution Guide</h1>
        <h2>1. Setup</h2>
        <ul>
          <li>Make sure that you have <a href="https://nodejs.org/es/download/" rel="noreferrer" target="_blank">node</a>,<a href="https://www.npmjs.com/get-npm" rel="noreferrer" target="_blank">npm</a> & <a href="https://pnpm.js.org/en/cli/install" rel="noreferrer" target="_blank">pnpm</a> installed.</li>
          <li>Clone the repo from <a href="https://github.com/Datawheel/canon" rel="noreferrer" target="_blank">Github</a> using git: <code className="bp3-code">git clone git@github.com:Datawheel/canon.git</code></li>
        </ul>
        <h2>2. Environment</h2>
        <ul>
          <li>To install dependencies run <code className="bp3-code">pnpm i</code> from root folder.</li>
          <li>Consider that Canon is a <a href="https://en.wikipedia.org/wiki/Monorepo" rel="noreferrer" target="_blank">Monorepo</a> so a built-in example site is provided.</li>
          <li><code className="bp3-code">// TODO -> explain env vars</code></li>
          <li>Go to <code className="bp3-code">/examples</code> and run <code className="bp3-code">pnpm run dev</code></li>
          <li>Application must be live in <code className="bp3-code">http://localhost:3300/</code></li>
        </ul>
        <h2>3. Changes</h2>
        <ul>
          <li>Canon's development process includes <a href="https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests" rel="noreferrer" target="_blank">Github's Pull Requests</a></li>
          <li>Before start create a new local branch <code className="bp3-code">git branch -m branch-name</code> (Try that the <code className="bp3-code">branch-name</code> describes the feature/bug to solved.)</li>
          <li>Make all the changes you need. Add them to the stage.</li>
          <li>Make sure that your commit message is expresive enough (and that has a reference to an issue). <code className="bp3-code">git commit -m "side bar menu is working fixed #343"</code> (Where 343 is the issue number in Github)</li>
          <li>Push all changes to the remote branch <code className="bp3-code">git pull origin branch-name</code></li>
          <li>Create a Pull Request to <code className="bp3-code">master</code></li>
          <li>If there are comments the reviewer will let you know and you have to respond to that (commenting or changing the code). Update the same branch, no need to create a new one.</li>
          <li>Once changes are approved and changes succefully merged with <code className="bp3-code">master</code>, make sure that all related <a href="https://github.com/Datawheel/canon/issues" rel="noreferrer" target="_blank">issues</a>  are closed and moved to <code className="bp3-code">Done</code> in the <a href="https://github.com/Datawheel/canon/projects/5" rel="noreferrer" target="_blank">project board</a></li>
          <li>Celebrate!</li>
        </ul>

      </div>
    );

  }
}

export default hot(Contribution);
