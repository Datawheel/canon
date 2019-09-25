import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import ReactTable from "react-table";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {Dialog, Icon, EditableText, Spinner} from "@blueprintjs/core";

import Button from "../components/fields/Button";
import ButtonGroup from "../components/fields/ButtonGroup";
import TextButtonGroup from "../components/fields/TextButtonGroup";
import FilterSearch from "../components/fields/FilterSearch";
import Select from "../components/fields/Select";

import "./MetaEditor.css";

const IMAGES_PER_PAGE = 48;

class MetaEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceData: [],
      data: [],
      query: "",
      columns: [],
      dimensions: [],
      dialogMode: "direct",
      filterBy: "all",
      filterKey: "dimension",
      flickrQuery: "",
      flickrImages: [],
      imageEnabled: false,
      isOpen: false,
      currentRow: {},
      loading: false,
      searching: false,
      imgIndex: 0,
      url: ""
    };
  }

  componentDidMount() {
    const epoch = new Date().getTime();
    axios.get("/api/isImageEnabled").then(resp => {
      const imageEnabled = resp.data;
      this.setState({epoch, imageEnabled}, this.hitDB.bind(this));
    });
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
    return <EditableText
      key={`cell-${cell.original.contentId}`}
      confirmOnEnterKey={true}
      multiline={true}
      onChange={this.changeCell.bind(this, cell, context, locale)}
      value={cell.value}
      placeholder={`add ${
        context === "attr" ? "hints"
          : context === "meta" ? "description"
            : context
      }`}
      intent={isBrokenJSON ? "danger" : "none"}
      onConfirm={this.saveCell.bind(this, cell, context, locale)}
    />;
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
    return cell.value;
  }
  columnWidths(key) {
    if (key.includes("keywords") || key.includes("meta") || key.includes("attr")) return 160;
    else if (key.includes("zvalue") || key.includes("image") || key.includes("dimension") || key.includes("hierarchy")) return 120;
    else return 90;
  }
  renderColumn = col => Object.assign({}, {
    Header: this.renderHeader(
      col === "hierarchy" ? "subdimension"
        : col === "zvalue" ? "z value"
          : col
    ),
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
    const {epoch, imageEnabled} = this.state;
    const data = this.fetchStringifiedSourceData.bind(this)();
    let skip = ["stem", "imageId", "contentId"];
    if (!imageEnabled) skip = skip.concat("image");
    const keySort = ["id", "slug", "content", "zvalue", "dimension", "hierarchy", "image"];
    const fields = Object.keys(data[0])
      .filter(d => !skip.includes(d))
      .sort((a, b) => keySort.indexOf(a) - keySort.indexOf(b));

    const idColumns = [];
    const classColumns = [];
    const searchColumns = [];
    const displayColumns = [];

    const columns = [
      {Header: "identification",  columns: idColumns},
      {Header: "classification",  columns: classColumns},
      {Header: "search",          columns: searchColumns},
      {Header: "display",         columns: displayColumns}
    ];

    fields.forEach(field => {
      if (field === "image") {
        displayColumns.push({
          id: "image",
          Header: this.renderHeader("image"),
          minWidth: this.columnWidths("image"),
          accessor: d => d.image ? d.image.url : null,
          Cell: cell => {
            const imgURL = `/api/image?dimension=${cell.original.dimension}&id=${cell.original.id}&type=thumb&t=${epoch}`;
            return cell.value
              // image wrapped inside a button
              ? <button className="cp-table-cell-cover-button" onClick={this.clickCell.bind(this, cell)}>
                <img className="cp-table-cell-img" src={imgURL} alt="add image" />
              </button>
              // normal cell with a button
              : <Button
                onClick={this.clickCell.bind(this, cell)}
                context="cms"
                fontSize="xxs"
                iconPosition="left"
                block
              >
                add image
              </Button>;
          }
        });
        displayColumns.push({
          id: `meta (${localeDefault})`,
          Header: this.renderHeader(locale ? `${localeDefault} image description` : "image description"),
          minWidth: this.columnWidths("meta"),
          accessor: d => {
            const content = d.image ? d.image.content.find(c => c.locale === localeDefault) : null;
            return content ? content.meta : null;
          },
          Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", localeDefault) : this.renderCell(cell)
        });
        if (locale) {
          displayColumns.push({
            id: `meta (${locale})`,
            Header: this.renderHeader(`${locale} image description`),
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
          let columnGroup = idColumns;
          if (prop === "keywords") columnGroup = searchColumns;
          if (prop === "attr") columnGroup = displayColumns;

          columnGroup.push({
            id: `${prop} (${localeDefault})`,
            Header: this.renderHeader(`${locale ? `${localeDefault} ` : ""}${prop === "attr" ? "language hints" : prop}`),
            minWidth: this.columnWidths(prop),
            accessor: d => {
              const content = d.content.find(c => c.locale === localeDefault);
              return content ? content[prop] : null;
            },
            Cell: cell => prop !== "name" ? this.renderEditable.bind(this)(cell, prop, localeDefault) : this.renderCell(cell)
          });
          if (locale) {
            columnGroup.push({
              id: `${prop} (${locale})`,
              Header: this.renderHeader(`${locale} ${prop === "attr" ? "language hints" : prop}`),
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
        let columnGroup = idColumns;
        if (field === "zvalue") columnGroup = searchColumns;
        if (field === "dimension" || field === "hierarchy") columnGroup = classColumns;
        columnGroup.push(this.renderColumn(field));
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
    const searchGet = axios.get("/api/search/all");
    const metaGet = axios.get("/api/cms/meta");
    Promise.all([searchGet, metaGet]).then(resp => {
      const sourceData = resp[0].data;
      const metaData = resp[1].data;
      const dimensions = {};
      metaData.forEach(meta => {
        if (!dimensions[meta.dimension]) {
          dimensions[meta.dimension] = meta.levels;
        }
        else {
          dimensions[meta.dimension] = [...new Set([...dimensions[meta.dimension], ...meta.levels])];
        }
      });
      this.setState({dimensions, sourceData}, this.prepData.bind(this));
    });
  }

  save(currentRow, shortid, id) {
    const {contentId} = currentRow;
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
          const imgIndex = 0;
          const epoch = new Date().getTime();
          this.setState({isOpen, sourceData, loading, url, flickrImages, imgIndex, epoch, dialogMode: "direct"}, this.prepData.bind(this));
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
    const Toast = this.context.toast.current;
    this.setState({searching: true});
    axios.get(`/api/flickr/search?q=${flickrQuery}`).then(resp => {
      if (resp.data.error) {
        Toast.show({
          intent: "danger",
          message: `Flickr Search Error - ${resp.data.error}`,
          timeout: 2000
        });
        this.setState({searching: false});
      }
      else {
        const flickrImages = resp.data || [];
        this.setState({flickrImages, searching: false});
      }
    });
  }

  showNext() {
    this.setState({imgIndex: this.state.imgIndex + IMAGES_PER_PAGE});
  }

  processFiltering() {
    const {query} = this.state;
    let {filterBy} = this.state;
    // The user may have clicked either a dimension or a hierarchy. Determine which.
    const filterKey = filterBy.includes("hierarchy_") ? "hierarchy" : "dimension";
    filterBy = filterBy.replace("hierarchy_", "").replace("dimension_", "");
    const sourceData = this.fetchStringifiedSourceData.bind(this)();
    const data = sourceData
      .filter(d => d[filterKey] === filterBy || filterBy === "all")
      .filter(d =>
        query === "" ||
        d.slug && d.slug.includes(query.toLowerCase()) ||
        d.content.some(c => c.name.toLowerCase().includes(query.toLowerCase())) ||
        d.content.some(c => c.attr && c.attr.toLowerCase().includes(query.toLowerCase())) ||
        d.content.some(c => c.keywords && c.keywords.toLowerCase().includes(query.toLowerCase())) ||
        d.image && d.image.content && d.image.content.some(c => c.meta.toLowerCase().includes(query.toLowerCase()))
      );
    this.setState({data, filterKey});
  }

  resetFiltering() {
    this.setState({query: "", filterBy: "all", filterKey: "dimension"}, this.processFiltering.bind(this));
  }
  resetQuery() {
    this.setState({query: ""}, this.processFiltering.bind(this));
  }

  onChange(field, e) {
    this.setState({[field]: e.target.value}, this.processFiltering.bind(this));
  }

  closeEditor() {
    this.setState({url: "", flickrImages: [], isOpen: false, dialogMode: "direct", loading: false, imgIndex: 0});
  }

  render() {
    const {
      columns,
      currentRow,
      data,
      dialogMode,
      dimensions,
      query,
      epoch,
      filterBy,
      filterKey,
      flickrQuery,
      flickrImages,
      isOpen,
      loading,
      searching,
      imgIndex,
      url
    } = this.state;

    return (
      <div className="cms-panel meta-editor">
        <div className="cms-sidebar cms-meta-header">
          <h1 className="u-visually-hidden">Edit entities</h1>
          <h2 className="cms-meta-header-heading u-margin-top-off u-font-xs">Filters</h2>
          <Button
            className="cms-meta-header-button"
            onClick={this.resetFiltering.bind(this)}
            disabled={query === "" && filterBy === "all"}
            context="cms"
            fontSize="xxs"
            icon="cross"
            iconOnly
          >
            Clear all filters
          </Button>

          <div className="cms-meta-controls">
            <FilterSearch
              label="filter by name, slug, keywords..."
              onChange={this.onChange.bind(this, "query")}
              onReset={this.resetQuery.bind(this)}
              value={query}
              context="cms"
              fontSize="xs"
            />

            <Select
              label={filterKey === "dimension" ? "Dimension" : "Subdimension"}
              inline
              fontSize="xs"
              context="cms"
              value={filterBy}
              onChange={this.onChange.bind(this, "filterBy")}
            >
              <option key="all" value="all">All</option>
              {Object.keys(dimensions).map(dim =>
                <optgroup key={dim} label={dim}>
                  {/* show the dimension as the first option in each group */}
                  <option key={`dimension_${dim}`} value={`dimension_${dim}`}>{dim}</option>
                  {/* Show indented subdimensions */}
                  {dimensions[dim].map(hierarchy =>
                    !dimensions[dim].includes(dim) || dimensions[dim].length !== 1
                      ? <option key={`hierarchy_${hierarchy}`} value={`hierarchy_${hierarchy}`}>   {hierarchy}</option>
                      : ""
                  )}
                </optgroup>

              )}
            </Select>

          </div>
        </div>

        <div className="cms-editor cms-meta-table-container">
          <h2 className="u-visually-hidden">Members</h2>
          <ReactTable
            className="cms-meta-table"
            data={data}
            columns={columns}
            pageSize={data.length > 10 ? 10 : data.length}
            showPagination={data.length > 10}
          />
        </div>

        <Dialog
          className={`cms-meta-popover${flickrImages.length > 0 ? " cms-gallery-popover" : ""}`}
          isOpen={isOpen}
          onClose={this.closeEditor.bind(this)}
          title="Image editor"
          usePortal={false}
        >

          {/* tab between direct & search modes */}
          <ButtonGroup className="cms-meta-popover-button-group" context="cms">
            <Button
              active={dialogMode === "direct"}
              fontSize="xs"
              context="cms"
              icon="link"
              iconPosition="left"
              onClick={() => this.setState({dialogMode: "direct"})}
            >
              direct link
            </Button>
            <Button
              active={dialogMode === "search"}
              fontSize="xs"
              context="cms"
              icon="search"
              iconPosition="left"
              onClick={() => this.setState({dialogMode: "search"})}
            >
              search
            </Button>
          </ButtonGroup>

          <div className="cms-meta-popover-inner">
            <h2 className="cms-meta-popover-heading u-font-md u-margin-top-off u-margin-bottom-xs">
              {dialogMode === "direct"
                ? currentRow.imageId ? "Current image" : "Flickr URL"
                : "Search Flickr"
              }
            </h2>

            {dialogMode === "direct"
              // paste in a URL
              ? <React.Fragment>
                <TextButtonGroup
                  className="u-margin-bottom-md"
                  context="cms"
                  inputProps={{
                    label: "Flickr direct link",
                    placeholder: "https://flickr.com/url",
                    value: url,
                    onChange: e => this.setState({url: e.target.value}),
                    context: "cms",
                    labelHidden: true,
                    autoFocus: true
                  }}
                  buttonProps={{
                    onClick: this.save.bind(this, currentRow, url.replace("https://flic.kr/p/", ""), null),
                    context: "cms",
                    children: currentRow.imageId ? "update" : "submit"
                  }}
                />

                <div className="cms-meta-selected-img-wrapper">
                  {currentRow.imageId && currentRow.dimension && currentRow.id
                    ? <img
                      className="cms-meta-selected-img"
                      src={`/api/image?dimension=${currentRow.dimension}&id=${currentRow.id}&type=thumb&t=${epoch}`}
                      alt=""
                      draggable="false"
                    />
                    : <div className="cms-meta-selected-img-error">
                      <p className="cms-meta-selected-img-error-text">
                        No image associated with this profile.
                        <Button
                          className="u-margin-top-xs"
                          onClick={() => this.setState({dialogMode: "search"})}
                          context="cms"
                          block
                        >
                          Search Flickr
                        </Button>
                      </p>
                    </div>
                  }
                </div>
              </React.Fragment>

              // search Flickr
              : <React.Fragment>
                <TextButtonGroup
                  context="cms"
                  inputProps={{
                    label: "Flickr image search",
                    placeholder: "Search Flickr images",
                    value: flickrQuery,
                    onChange: e => this.setState({flickrQuery: e.target.value}),
                    context: "cms",
                    labelHidden: true,
                    autoFocus: true,
                    disabled: searching
                  }}
                  buttonProps={{
                    onClick: this.searchFlickr.bind(this),
                    context: "cms",
                    children: "search",
                    disabled: searching
                  }}
                />

                { searching || loading
                  // alerts
                  ? <div className="cms-gallery-searching">
                    <Spinner size="50" className="cms-gallery-spinner u-margin-bottom-sm"/>
                    <p className="cms-gallery-searching-text u-font-xl">
                      {searching
                        ? `Searching Flickr for useable ${flickrQuery} images…`
                        : "Importing image…"
                      }
                    </p>
                  </div>
                  // display images
                  : flickrImages.length > 0 &&
                    <div className="cms-gallery-wrapper">
                      <ul className="cms-gallery-list">
                        {flickrImages.slice(0, imgIndex + IMAGES_PER_PAGE).map(image =>
                          <li className="cms-gallery-item" key={image.id}>
                            <button className="cms-gallery-button" onClick={this.save.bind(this, currentRow, null, image.id)}>
                              <img className="cms-gallery-img" src={image.source} alt="add image" />
                            </button>
                          </li>
                        )}
                      </ul>
                      {imgIndex + IMAGES_PER_PAGE < flickrImages.length &&
                        <Button
                          className="cms-gallery-more-button"
                          onClick={this.showNext.bind(this)}
                          context="cms"
                          block
                        >
                          load more
                        </Button>
                      }
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

MetaEditor.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  env: state.env
});

export default connect(mapStateToProps)(hot(MetaEditor));
