import React, {Component} from "react";
import axios from "axios";
import "./DeepSearch.css";

export default class DeepSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      q: "",
      results: {},
      grouped: false
    };
  }

  search() {
    const {q} = this.state;
    axios.get(`/api/deepsearch?query=${q}`).then(resp => {
      this.setState({results: resp.data});
    });
  }

  keyPress(e) {
    if (e.keyCode === 13) this.search.bind(this)();
  }

  linkify(result) {
    const link = result.reduce((acc, d) => acc.concat(`/${d.slug}/${d.memberSlug}`), "/profile");
    const name = result.map(d => d.name).join("/");
    return <a href={link}>{`${name} (${result[0].avg || result[0].ranking})`}</a>;
  }

  render() {
    
    const {q, results, grouped} = this.state;

    return (
      <div id="Search">
        <input type="text" value={q} onKeyDown={this.keyPress.bind(this)} onChange={e => this.setState({q: e.target.value})}/>
        <button onClick={this.search.bind(this)} >SEARCH</button>
        <span>Grouped? <input type="checkbox" onChange={e => this.setState({grouped: e.target.checked})} value={grouped}/></span>
        { !grouped && results.profiles && 
          <div className="cms-deepsearch-container">
            {Object.keys(results.profiles).map((profile, i) => 
              <div key={`p-${i}`}>
                <h3>{profile}</h3>
                <ul className="cms-deepsearch-list">
                  {results.profiles[profile].map((result, j) => 
                    <li key={`r-${j}`}>{this.linkify(result)}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        }
        { grouped && results.grouped && 
          <div className="cms-deepsearch-container">
            <ul className="cms-deepsearch-list">
              {results.grouped.map((result, i) => <li key={`r-${i}`}>{this.linkify(result)}</li>)}
            </ul>
          </div>
        }
      </div>
    );
  }

}
