import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import ReactTable from "react-table";
import Select from "../components/fields/Select";
import {Dialog, Spinner, EditableText} from "@blueprintjs/core";
import FooterButtons from "../components/editors/components/FooterButtons";
import PropTypes from "prop-types";

import "./MemberBuilder.css";

class MemberBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceData: [],
      data: [],
      query: "",
      columns: [],
      dimensions: [],
      dimension: "all",
      hierarchies: [],
      hierarchy: "all",
      isOpen: false,
      currentRow: {},
      loading: false
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locale !== this.props.locale) {
      this.prepData.bind(this)();
      this.processFiltering.bind(this)();
    }
  }

  clickCell(cell) {
    const currentRow = cell.original;
    const url = currentRow.image && currentRow.image.url ? currentRow.image.url : "";
    const isOpen = true;
    this.setState({url, isOpen, currentRow});
  }

  changeCell(cell, context, locale, value) {
    if (context === "meta") {
      const data = this.state.data.map(d => {
        if (d.contentId === cell.original.contentId) {
          if (d.image) {
            const content = d.image.content.find(c => c.locale === locale);
            if (content) {
              content.meta = value;
            }
            else {
              d.image.content.push({
                id: d.image.id,
                locale,
                meta: value
              });
            }
          }
          return d;
        }
        else {
          return d;
        }
      });
      this.setState({data});
    }
  }

  renderEditable(cell, context, locale) {
    return <EditableText
      confirmOnEnterKey={true}
      onChange={this.changeCell.bind(this, cell, context, locale)}
      value={cell.value}
      onConfirm={this.saveCell.bind(this, cell, context, locale)}
    />;
  }

  saveCell(cell, context, locale) {
    const {data} = this.state;
    const {contentId} = cell.original;
    const row = data.find(c => c.contentId === contentId);
    if (row && row.image && row.image.content) {
      const content = row.image.content.find(c => c.locale === locale);
      if (content) {
        const payload = content;
        axios.post("/api/image_content/update", payload).then(resp => {
          console.log("updated", resp.data);
        });
      }
      else {
        /*const newLocaleContent = {
          id: row.imageId,
          locale,

        };
        row.image.content.push
        */
        // const payload = 
        /*
        axios.post("/api/image_content/create", content).then(resp => {
          console.log("created", resp.data);
        });
        */
      }
    }
  }


  /**
   * Once sourceData has been set, prepare the two variables that react-table needs: data and columns.
   */
  prepData() {
    const {sourceData} = this.state;
    const {locale, localeDefault} = this.props;
    sourceData.sort((a, b) => {
      if (a.dimension === b.dimension) {
        return b.zvalue - a.zvalue;
      }
      return a.dimension < b.dimension ? 1 : -1;
    });
    const data = sourceData;
    const skip = ["stem", "imageId", "contentId"];
    const fields = Object.keys(data[0]).filter(d => !skip.includes(d));
    const columns = [];
    fields.forEach(field => {
      if (field === "image") {
        columns.push({
          id: "image",
          Header: "image",
          accessor: d => d.image ? d.image.url : null,
          Cell: cell => <span onClick={this.clickCell.bind(this, cell)} className="cp-table-cell-inner">
            {cell.value ? cell.value : "+ Add Image"}
          </span>
        });
        columns.push({
          id: `meta (${localeDefault})`,
          Header: `meta (${localeDefault})`,
          accessor: d => {
            const content = d.image ? d.image.content.find(c => c.locale === localeDefault) : null;
            return content ? content.meta : null;
          },
          Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", localeDefault) : cell.value
        });
        columns.push({
          id: `meta (${locale})`,
          Header: `meta (${locale})`,
          accessor: d => {
            const content = d.image ? d.image.content.find(c => c.locale === locale) : null;
            return content ? content.meta : null;
          },
          Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", locale) : cell.value
        });
      }
      else if (field === "content") {
        columns.push({
          id: `name (${localeDefault})`,
          Header: `name (${localeDefault})`,
          accessor: d => {
            const content = d.content.find(c => c.locale === localeDefault);
            return content ? content.name : null;
          }
        });
        columns.push({
          id: `name (${locale})`,
          Header: `name (${locale})`,
          accessor: d => {
            const content = d.content.find(c => c.locale === locale);
            return content ? content.name : null;
          }
        });
      }
      else {
        columns.push({
          Header: field,
          accessor: field
        });
      }
    });
    this.setState({sourceData, data, columns});
  }

  /**
   * Hit the search endpoint for all possible members, all locales, and their image meta
   * Use this to popluate the filtering dropdowns, and set sourceData to the pure payload.
   * Then call prepData to turn the sourceData into columns for the table.
   */
  hitDB() {
    axios.get("/api/search/all").then(resp => {
      if (resp.status === 200 && resp.data && resp.data[0]) {
        const sourceData = resp.data;
        const dimensions = ["all"].concat([... new Set(sourceData.map(d => d.dimension))]);
        const hierarchies = ["all"].concat([... new Set(sourceData.map(d => d.hierarchy))]);
        this.setState({dimensions, hierarchies, sourceData}, this.prepData.bind(this));
      } 
      else {
        console.log("Fetch Error in MemberBuilder.jsx");
      }
    });  
  }

  save(currentRow) {
    const {url} = this.state;
    const {contentId} = currentRow;
    const Toast = this.context.toast.current;
    const payload = {url, contentId};
    this.setState({loading: true});
    axios.post("/api/image/update", payload).then(resp => {
      if (resp.data) {
        if (resp.data.error) {
          Toast.show({
            intent: "danger",
            message: `Invalid Flickr Link - ${resp.data.error}`,
            timeout: 2000
          });
          this.setState({loading: false});
        }
        else {
          const row = resp.data;
          const sourceData = this.state.sourceData.map(d => row.contentId === d.contentId ? row : d);
          const isOpen = false;
          const loading = false;
          this.setState({isOpen, sourceData, loading}, this.prepData.bind(this));
          Toast.show({
            intent: "success",
            message: "Success!",
            timeout: 2000
          });
        }
      }
    });
    
    /*

    const {url} = this.state;
    const {contentId} = currentRow;
    const payload = {contentId, url};
    axios.post("/api/search/update", payload).then(resp => {
      const row = resp.data;
      const sourceData = this.state.sourceData.map(d => row.contentId === d.contentId ? row : d);
      const isOpen = false;
      this.setState({isOpen, sourceData}, this.prepData.bind(this));
    });
    */
  }

  processFiltering() {
    const {dimension, hierarchy, query} = this.state;
    const data = this.state.sourceData
      .filter(d => d.dimension === dimension || dimension === "all")
      .filter(d => d.hierarchy === hierarchy || hierarchy === "all")
      .filter(d => d.slug.includes(query) || query === ""); // TODO: ADD MULTI LANG NAME
    this.setState({data});
  }

  resetFiltering() {
    this.setState({query: "", dimension: "all", hierarchy: "all"}, this.processFiltering.bind(this));
  }

  onChange(field, e) {
    this.setState({[field]: e.target.value}, this.processFiltering.bind(this));
  }

  closeEditor() {
    this.setState({url: "", isOpen: false, loading: false});
  }

  render() {

    const {
      columns, 
      currentRow,
      data, 
      dimension, 
      dimensions, 
      query,
      hierarchy, 
      hierarchies, 
      isOpen, 
      loading,
      url
    } = this.state;

    return (
      <React.Fragment>
        <Dialog
          isOpen={isOpen}
          onClose={this.closeEditor.bind(this)}
          title="Choose Image URL"
          usePortal={false}
        >
          <div className="bp3-dialog-body">
            <h3>Instructions</h3>
            <ul>
              <li>Go To Flickr.com</li>
              <li>Search for an image</li>
              <li>Change the License to <strong>Commercial use & mods allowed</strong></li>
              <li>Choose and image and click it</li>
              <li>Click the Share Button on the bottom right</li>
              <li>Paste the URL below.</li>
            </ul>
            Enter a Flickr URL
            <input className="cms-flickr-input" value={url} onChange={e => this.setState({url: e.target.value})}/>
          </div>
          {loading ? <Spinner size="30" className="cms-spinner"/> : <FooterButtons onSave={this.save.bind(this, currentRow)} />}
        </Dialog>
        <div className="cms-panel member-panel">
          <h3>Filters</h3>
          <div className="cms-member-filter-container">
            Search Query: <input value={query} onChange={this.onChange.bind(this, "query")}/>
            <Select
              label="Dimension"
              inline
              context="cms"
              value={dimension}
              onChange={this.onChange.bind(this, "dimension")}
            >
              {dimensions.map(dim =>
                <option key={dim} value={dim}>{dim}</option>
              )}
            </Select>
            <Select
              label="Hierarchy"
              inline
              context="cms"
              value={hierarchy}
              onChange={this.onChange.bind(this, "hierarchy")}
            >
              {hierarchies.map(hier =>
                <option key={hier} value={hier}>{hier}</option>
              )}
            </Select>
            <button onClick={this.resetFiltering.bind(this)}>Reset Filters</button>
          </div>
          <h3>Members</h3>
          <ReactTable
            className="cms-member-table"
            data={data}
            columns={columns}
            defaultPageSize={10}
          />
        </div>
      </React.Fragment>
    );
  }
}

MemberBuilder.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  env: state.env
});

export default connect(mapStateToProps)(MemberBuilder);
