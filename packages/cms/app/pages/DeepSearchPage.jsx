import React, {Component} from "react";
import axios from "axios";
import "./DeepSearchPage.css";

export default class DeepSearchPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      q: "",
      results: {}
    };
  }

  search() {
    const {q} = this.state;
    axios.get(`/api/deepsearch?query=${q}`).then(resp => {
      console.log(resp.data);
      this.setState({results: resp.data});
    });
  }

  linkify(result) {
    if (Array.isArray(result)) {
      const link = result.reduce((acc, d) => acc.concat(`/${d.slug}/${d.memberSlug}`), "/profile");
      const name = result.map(d => d.name).join("/");
      return <a href={link}>{name}</a>;
    }
    else {
      return <a href={`/profile/${result.slug}/${result.memberSlug}`}>{result.name}</a>
    }
  }

  render() {
    
    const {q, results} = this.state;

    return (
      <div id="Search">
        <input type="text" value={q} onChange={e => this.setState({q: e.target.value})}/>
        <button onClick={this.search.bind(this)} >SEARCH</button>
        { results.profiles && 
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
      </div>
    );
  }

}
