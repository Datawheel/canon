import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import ReactTable from "react-table";
import Base58 from "base58";
import PropTypes from "prop-types";
import {Dialog, Icon, EditableText, Spinner} from "@blueprintjs/core";

import Button from "../components/fields/Button";
import FilterSearch from "../components/fields/FilterSearch";
import Select from "../components/fields/Select";
import FooterButtons from "../components/editors/components/FooterButtons";

import "./MemberBuilder.css";

const IMAGES_PER_PAGE = 5;

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
      flickrQuery: "",
      flickrImages: [],
      isOpen: false,
      currentRow: {},
      loading: false,
      searching: false,
      offset: 0,
      url: ""
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
    const {localeDefault} = this.props;
    const currentRow = cell.original;
    const url = currentRow.image && currentRow.image.url ? currentRow.image.url : "";
    const isOpen = true;
    const content = currentRow.content.find(d => d.locale === localeDefault);
    const flickrQuery = content ? content.name : "";
    this.setState({url, isOpen, currentRow, flickrQuery});
  }

  changeCell(cell, context, locale, value) {
    const data = this.state.data.map(row => {
      if (row.contentId === cell.original.contentId) {
        if (context === "meta") {
          if (row.image) {
            const content = row.image.content.find(c => c.locale === locale);
            if (content) {
              content.meta = value;
            }
            else {
              row.image.content.push({
                id: row.image.id,
                locale,
                meta: value
              });
            }
          }
          return row;
        }
        else if (context === "attr") {
          const content = row.content.find(c => c.locale === locale);
          if (content) {
            content.attr = value;
          }
          return row;
        }
        else if (context === "keywords") {
          const content = row.content.find(c => c.locale === locale);
          if (content) {
            content.keywords = value;
          }
          return row;
        }
        else {
          return row;
        }
      }
      else {
        return row;
      }
    });
    this.setState({data});
  }

  renderEditable(cell, context, locale) {
    let isBrokenJSON = false;
    if (context === "attr") {
      const {contentId} = cell.original;
      const row = this.state.data.find(c => c.contentId === contentId);
      const content = row.content.find(c => c.locale === locale);
      if (content && content.attr) {
        try {
          JSON.parse(content.attr);
        }
        catch (e) {
          isBrokenJSON = true;
        }
      }
    }
    return <span className="cp-table-cell-inner">
      <EditableText
        key={`cell-${cell.original.contentId}`}
        confirmOnEnterKey={true}
        multiline={true}
        onChange={this.changeCell.bind(this, cell, context, locale)}
        value={cell.value}
        intent={isBrokenJSON ? "danger" : "none"}
        onConfirm={this.saveCell.bind(this, cell, context, locale)}
      />
    </span>;
  }

  saveCell(cell, context, locale) {
    const {data} = this.state;
    const {contentId} = cell.original;
    const row = data.find(c => c.contentId === contentId);
    if (context === "meta") {
      if (row && row.image && row.image.content) {
        const content = row.image.content.find(c => c.locale === locale);
        if (content) {
          axios.post("/api/image_content/update", content).then(resp => {
            if (!resp.status === 200) console.log("image update error");
          });
        }
      }
    }
    else if (context === "attr" || context === "keywords") {
      if (row && row.content) {
        const content = row.content.find(c => c.locale === locale);
        if (content) {
          const payload = {id: content.id, locale};
          if (context === "attr") {
            if (content.attr === "") {
              payload.attr = null;
            }
            else {
              try {
                payload.attr = JSON.parse(content.attr);
              }
              catch (e) {
                payload.attr = null;
              }
            }
          }
          if (context === "keywords") payload.keywords = content.keywords.split(",");
          axios.post("/api/search/update", payload).then(resp => {
            if (!resp.status === 200) console.log("search update error");
          });
        }
      }
    }

  }

  fetchStringifiedSourceData() {
    const {sourceData} = this.state;
    return sourceData
      .sort((a, b) => {
        if (a.dimension === b.dimension) {
          return b.zvalue - a.zvalue;
        }
        return a.dimension < b.dimension ? 1 : -1;
      })
      .map(d =>
        Object.assign({}, d, {content: d.content.map(c => {
          const stringifed = {};
          if (c.attr) {
            try {
              stringifed.attr = JSON.stringify(c.attr);
            }
            catch (e) {
              console.log("error stringifying: ", e);
            }
          }
          if (c.keywords) {
            stringifed.keywords = c.keywords.join();
          }
          return Object.assign({}, c, stringifed);
        })})
      );
  }

  /** formatting columns for react-table gets verbose, so here are some render functions */
  renderHeader(label) {
    return <button className="cp-table-header-button">
      {label} <span className="u-visually-hidden">, sort by column</span>
      <Icon className="cp-table-header-icon" icon="caret-down" />
    </button>;
  }
  renderCell(cell) {
    return <span className="cp-table-cell-inner">{cell.value}</span>;
  }
  columnWidths(key) {
    if (key.includes("keywords") || key.includes("image")) return 120;
    else if (key.includes("meta") || key.includes("attr")) return 160;
    else return 90;
  }
  renderColumn = col => Object.assign({}, {
    Header: this.renderHeader(col),
    id: col,
    accessor: d => d[col],
    Cell: cell => this.renderCell(cell),
    minWidth: this.columnWidths(col)
  });

  /**
   * Once sourceData has been set, prepare the two variables that react-table needs: data and columns.
   */
  prepData() {
    const {locale, localeDefault} = this.props;
    const data = this.fetchStringifiedSourceData.bind(this)();
    const skip = ["stem", "imageId", "contentId"];
    const keySort = ["id", "slug", "content", "zvalue", "dimension", "hierarchy", "image"];
    const fields = Object.keys(data[0])
      .filter(d => !skip.includes(d))
      .sort((a, b) => keySort.indexOf(a) - keySort.indexOf(b));
    const columns = [];
    fields.forEach(field => {
      if (field === "image") {
        columns.push({
          id: "image",
          Header: this.renderHeader("image"),
          minWidth: this.columnWidths("image"),
          accessor: d => d.image ? d.image.url : null,
          Cell: cell => <span className="cp-table-cell-inner">
            {cell.value ? <img src={cell.value} alt={cell.value} /> : ""}
            <Button
              onClick={this.clickCell.bind(this, cell)}
              context="cms"
              fontSize="xxs"
              icon={cell.value ? "cog" : "plus" }
              iconPosition="left"
              block
            >
              {cell.value ? "edit image" : "add image"}
            </Button>
          </span>
        });
        columns.push({
          id: `meta (${localeDefault})`,
          Header: this.renderHeader(`meta (${localeDefault})`),
          minWidth: this.columnWidths("meta"),
          accessor: d => {
            const content = d.image ? d.image.content.find(c => c.locale === localeDefault) : null;
            return content ? content.meta : null;
          },
          Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", localeDefault) : this.renderCell(cell)
        });
        if (locale) {
          columns.push({
            id: `meta (${locale})`,
            Header: this.renderHeader(`meta (${locale})`),
            minWidth: this.columnWidths("meta"),
            accessor: d => {
              const content = d.image ? d.image.content.find(c => c.locale === locale) : null;
              return content ? content.meta : null;
            },
            Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", locale) : this.renderCell(cell)
          });
        }
      }
      else if (field === "content") {
        ["name", "attr", "keywords"].forEach(prop => {
          columns.push({
            id: `${prop} (${localeDefault})`,
            Header: this.renderHeader(`${prop} (${localeDefault})`),
            minWidth: this.columnWidths(prop),
            accessor: d => {
              const content = d.content.find(c => c.locale === localeDefault);
              return content ? content[prop] : null;
            },
            Cell: cell => prop !== "name" ? this.renderEditable.bind(this)(cell, prop, localeDefault) : this.renderCell(cell)
          });
          if (locale) {
            columns.push({
              id: `${prop} (${locale})`,
              Header: this.renderHeader(`${prop} (${locale})`),
              minWidth: this.columnWidths(prop),
              accessor: d => {
                const content = d.content.find(c => c.locale === locale);
                return content ? content[prop] : null;
              },
              Cell: cell => prop !== "name" ? this.renderEditable.bind(this)(cell, prop, locale) : this.renderCell(cell)
            });
          }
        });
      }
      else {
        columns.push(this.renderColumn(field));
      }
    });
    this.setState({data, columns});
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

  save(currentRow, shortid, id) {
    const {contentId} = currentRow;
    if (id && !shortid) shortid = Base58.int_to_base58(id);
    if (!id && shortid) id = Base58.base58_to_int(shortid);
    const Toast = this.context.toast.current;
    const payload = {id, shortid, contentId};
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
          const url = "";
          const flickrImages = [];
          const offset = 0;
          this.setState({isOpen, sourceData, loading, url, flickrImages, offset}, this.prepData.bind(this));
          Toast.show({
            intent: "success",
            message: "Success!",
            timeout: 2000
          });
        }
      }
    });
  }

  searchFlickr() {
    const {flickrQuery} = this.state;
    this.setState({searching: true});
    axios.get(`/api/flickr/search?q=${flickrQuery}`).then(resp => {
      const flickrImages = resp.data || [];
      this.setState({flickrImages, searching: false});
    });
  }

  showNext() {
    this.setState({offset: this.state.offset + IMAGES_PER_PAGE});
  }

  showPrev() {
    this.setState({offset: this.state.offset - IMAGES_PER_PAGE});
  }

  processFiltering() {
    const {dimension, hierarchy, query} = this.state;
    const sourceData = this.fetchStringifiedSourceData.bind(this)();
    const data = sourceData
      .filter(d => d.dimension === dimension || dimension === "all")
      .filter(d => d.hierarchy === hierarchy || hierarchy === "all")
      .filter(d =>
        query === "" ||
        d.slug.includes(query.toLowerCase()) ||
        d.content.some(c => c.name.toLowerCase().includes(query.toLowerCase())) ||
        d.content.some(c => c.attr && c.attr.toLowerCase().includes(query.toLowerCase())) ||
        d.content.some(c => c.keywords && c.keywords.toLowerCase().includes(query.toLowerCase())) ||
        d.image && d.image.content && d.image.content.some(c => c.meta.toLowerCase().includes(query.toLowerCase()))
      );
    this.setState({data});
  }

  resetFiltering() {
    this.setState({query: "", dimension: "all", hierarchy: "all"}, this.processFiltering.bind(this));
  }
  resetQuery() {
    this.setState({query: ""}, this.processFiltering.bind(this));
  }

  onChange(field, e) {
    this.setState({[field]: e.target.value}, this.processFiltering.bind(this));
  }

  closeEditor() {
    this.setState({url: "", flickrImages: [], isOpen: false, loading: false, offset: 0});
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
      flickrQuery,
      flickrImages,
      isOpen,
      loading,
      searching,
      offset,
      url
    } = this.state;

    return (
      <div className="cms-panel member-editor">
        <div className="cms-member-header">
          <h1 className="u-visually-hidden">Edit entities</h1>
          <h2 className="cms-member-header-heading u-margin-top-off u-font-xs">Filters</h2>
          <Button
            className="cms-member-header-button"
            onClick={this.resetFiltering.bind(this)}
            disabled={query === "" && dimension === "all" && hierarchy === "all"}
            context="cms"
            fontSize="xxs"
            icon="cross"
            iconOnly
          >
            Clear all filters
          </Button>

          <div className="cms-member-controls">
            <FilterSearch
              label="filter by name, slug, keywords, meta..."
              onChange={this.onChange.bind(this, "query")}
              onReset={this.resetQuery.bind(this)}
              value={query}
              context="cms"
              fontSize="xs"
            />

            <Select
              label="Dimension"
              inline
              fontSize="xs"
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
              fontSize="xs"
              context="cms"
              value={hierarchy}
              onChange={this.onChange.bind(this, "hierarchy")}
            >
              {hierarchies.map(hier =>
                <option key={hier} value={hier}>{hier}</option>
              )}
            </Select>
          </div>
        </div>

        <div className="cms-member-table-container">
          <h2 className="u-visually-hidden">Members</h2>
          <ReactTable
            className="cms-member-table"
            data={data}
            columns={columns}
            pageSize={data.length}
            showPagination={false}
          />
        </div>

        <Dialog
          isOpen={isOpen}
          onClose={this.closeEditor.bind(this)}
          title="Choose Image URL"
          usePortal={false}
        >
          <div className="bp3-dialog-body">
            {loading
              ? <Spinner size="30" className="cms-spinner"/>
              : <React.Fragment>
                <h3>Manually enter Flickr Link</h3>
                <input value={url} onChange={e => this.setState({url: e.target.value})}/>
                <button onClick={this.save.bind(this, currentRow, url.replace("https://flic.kr/p/", ""), null)}>Save Manual Link</button>
                <h3>Flickr Image Search</h3>
                <input value={flickrQuery} onChange={e => this.setState({flickrQuery: e.target.value})} />
                <button onClick={this.searchFlickr.bind(this)}>Search for Images</button>
                { searching
                  ? <Spinner size="30" className="cms-spinner"/>
                  : flickrImages.length > 0 &&
                  <div>
                    <div className="cms-flickr-image-container">
                      {
                        flickrImages.slice(offset, offset + IMAGES_PER_PAGE).map(image =>
                          <div key={image.id} onClick={this.save.bind(this, currentRow, null, image.id)}>
                            <img className="cms-flickr-image" width="320" src={image.source}/>
                          </div>
                        )
                      }
                    </div>
                    {offset >= IMAGES_PER_PAGE && <button onClick={this.showPrev.bind(this)}>Previous</button>}
                    {offset + IMAGES_PER_PAGE < flickrImages.length && <button onClick={this.showNext.bind(this)}>Next</button>}
                  </div>
                }
              </React.Fragment>
            }
          </div>
        </Dialog>
      </div>
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
