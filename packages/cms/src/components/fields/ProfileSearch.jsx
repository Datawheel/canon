import React, {Component} from "react";
import axios from "axios";
import "./ProfileSearch.css";

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: false
    };
  }

  search() {
    const {query} = this.state;

    if (query) {
      axios.get(`/api/deepsearch?query=${query}`)
        .then(resp => {
          this.setState({results: resp.data});
        });
    }
    else {
      this.setState({results: false});
    }
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

    const {query, results} = this.state;
    const {display} = this.props;
    console.log(results);

    return (
      <div className="cms-profilesearch">
        <input type="text" value={query} onKeyDown={this.keyPress.bind(this)} onChange={e => this.setState({query: e.target.value})}/>
        <button onClick={this.search.bind(this)} >SEARCH</button>
        <div className="cms-profilesearch-container">
          {
            results
            ? (() => {

              switch(display) {

                case "columns":
                  return (
                    <React.Fragment>{Object.keys((results.profiles || {})).map((profile, i) =>
                      <div key={`p-${i}`}>
                        <h3>{profile}</h3>
                        <ul className="cms-profilesearch-list">
                          {(results.profiles[profile] || []).map((result, j) =>
                            <li key={`r-${j}`}>{this.linkify(result)}</li>
                          )}
                        </ul>
                      </div>
                    )}</React.Fragment>
                  );

                default:
                  return (
                    <ul className="cms-profilesearch-list">
                      {(results.grouped || []).map((result, i) => <li key={`r-${i}`}>{this.linkify(result)}</li>)}
                    </ul>
                  );

              }

            })()
            : <span>Please Search</span>
          }
        </div>
      </div>
    );
  }

}

ProfileSearch.defaultProps = {
  display: "list"
};

export default ProfileSearch;
