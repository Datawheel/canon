import axios from "axios";
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import ReactTable from "react-table";
import PropTypes from "prop-types";
import {Icon, EditableText, Spinner, Popover, Position} from "@blueprintjs/core";

import Dialog from "../components/interface/Dialog";
import Status from "../components/interface/Status";
import Button from "../components/fields/Button";
import ButtonGroup from "../components/fields/ButtonGroup";
import TextButtonGroup from "../components/fields/TextButtonGroup";
import FilterSearch from "../components/fields/FilterSearch";
import Select from "../components/fields/Select";

import "./MetaEditor.css";

const IMAGES_PER_PAGE = 48;
const ROWS_PER_PAGE = 10;

class MetaEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceData: [],
      cloudEnabled: false,
      cubes: [],
      currentCube: "",
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
      pageLoading: true,
      pageIndex: 0,
      pageSize: ROWS_PER_PAGE,
      querying: false,
      searching: false,
      typingTimeout: null,
      imgIndex: 0,
      url: ""
    };
  }

  componentDidMount() {
    const epoch = new Date().getTime();
    axios.get("/api/isImageEnabled").then(resp => {
      const {imageEnabled, cloudEnabled} = resp.data;
      this.setState({epoch, imageEnabled, cloudEnabled}, this.hitDB.bind(this));
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.status.localeSecondary !== this.props.status.localeSecondary) {
      this.prepData.bind(this)();
    }
  }

  clickCell(cell) {
    const {localeDefault} = this.props.status;
    const currentRow = cell.original;
    const url = currentRow.image && currentRow.image.url ? currentRow.image.url : "";
    const isOpen = true;
    const dialogMode = url.includes("custom-image") ? "upload" : this.state.dialogMode;
    const content = currentRow.content.find(d => d.locale === localeDefault);
    const flickrQuery = content ? content.name : "";
    this.setState({url, isOpen, currentRow, flickrQuery, dialogMode});
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
            content.keywords = value.replace(/\"/g, "").replace(/,\s/g, ",").replace(/\s,/g, ",");
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
      placeholder={`add ${context}`}
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

  fetchStringifiedSourceData(sourceData) {
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
    if (key.includes("preview")) return 220;
    else if (key.includes("keywords") || key.includes("meta") || key.includes("attr")) return 160;
    else if (key.includes("zvalue") || key.includes("image") || key.includes("dimension") || key.includes("hierarchy")) return 120;
    else return 90;
  }
  numericSort(a, b) {
    if (!isNaN(a) && !isNaN(b)) {
      return Number(a) - Number(b);
    }
    else return a.localeCompare(b);
  }
  renderColumn(col) {
    return Object.assign({}, {
      Header: this.renderHeader(col),
      id: col,
      sortMethod: col === "id" ? this.numericSort.bind(this) : undefined,
      accessor: d => d[col],
      Cell: cell => this.renderCell(cell),
      minWidth: this.columnWidths(col)
    });
  }

  cloudFix(cell) {
    if (cell.original.image) {
      const Toast = this.context.toast.current;
      const payload = {id: cell.original.image.id};
      this.setState({loading: true, popoverid: false});
      axios.post("/api/image/cloudfix", payload).then(resp => {
        if (resp.data) {
          if (resp.data.error) {
            Toast.show({
              intent: "danger",
              message: `Upload error - ${resp.data.error}`,
              timeout: 2000
            });
            this.setState({loading: false});
          }
          else {
            const rows = resp.data;
            let {sourceData} = this.state;
            for (const row of rows) {
              sourceData = this.state.sourceData.map(d => row.contentId === d.contentId ? row : d);
            }
            const loading = false;
            const popoverid = false;
            const epoch = new Date().getTime();
            this.setState({sourceData, loading, popoverid, epoch}, this.prepData.bind(this));
            Toast.show({
              intent: "success",
              message: "Success!",
              timeout: 2000
            });
          }
        }
      });
    }
  }

  /*
  linkify(member) {
    const {metaData} = this.state;
    const links = [];
    const relevantPids = metaData.filter(p => p.cubeName === member.cubeName).map(d => d.profile_id);
    relevantPids.forEach(pid => {
      const possibleDimensions = metaData.filter(p => p.profile_id === pid);
      if (possibleDimensions && possibleDimensions.map(d => d.ordering).every(d => d === 0)) {
        const relevantDimensions = possibleDimensions.filter(d => d.cubeName === member.cubeName);
        relevantDimensions.forEach(dimension => {
          links.push(`/profile/${dimension.slug}/${member.id}`);
        });
      }
    });
    return links;
  }
  */

  /**
   * Once sourceData has been set, prepare the two variables that react-table needs: data and columns.
   */
  prepData() {
    const {localeDefault, localeSecondary} = this.props.status;
    const {epoch, imageEnabled, cloudEnabled, sourceData} = this.state;
    const data = this.fetchStringifiedSourceData.bind(this)(sourceData);
    const skip = ["stem", "imageId", "contentId"];
    const keySort = ["id", "slug", "content", "zvalue", "dimension", "hierarchy", "image"];
    const fields = data[0] ? Object.keys(data[0])
      .filter(d => !skip.includes(d))
      .sort((a, b) => keySort.indexOf(a) - keySort.indexOf(b)) : [];

    const idColumns = [];
    const classColumns = [];
    const searchColumns = [];
    const displayColumns = [];
    const previewColumns = [];

    const columns = [
      {Header: "identification",  columns: idColumns},
      {Header: "classification",  columns: classColumns},
      {Header: "search",          columns: searchColumns},
      {Header: "display",         columns: displayColumns},
      {Header: "preview",         columns: previewColumns}
    ];

    fields.forEach(field => {
      if (field === "image") {
        displayColumns.push({
          id: "image",
          Header: this.renderHeader("image"),
          minWidth: this.columnWidths("image"),
          accessor: d => d.image ? d.image.url : null,
          Cell: cell => {
            const {dimension, cubeName, id, hierarchy} = cell.original;
            const imgURL = `/api/image?dimension=${dimension}&cubeName=${cubeName}&id=${id}&level=${hierarchy}&size=thumb&t=${epoch}`;
            return cell.value
              // image wrapped inside a button
              ? <React.Fragment><button className="cp-table-cell-cover-button" onClick={this.clickCell.bind(this, cell)}>
                <img className="cp-table-cell-img" src={imgURL} alt="add image" />
              </button>
              {imageEnabled && cloudEnabled && cell.original.image && cell.original.image.thumb && <Popover
                className="cms-img-upload-icon"
                position = {Position.RIGHT}
                isOpen={this.state.popoverid === cell.original.contentId}
              >
                <Icon icon="cloud-upload" iconSize={20} onClick={() => this.setState({popoverid: cell.original.contentId})}/>
                <div className="cms-img-upload-popover">
                  <p>This image is hosted locally, but cloud hosting appears to be configured. Upload?</p>
                  <button className="bp3-button bp3-intent-primary" onClick={this.cloudFix.bind(this, cell)}>Upload</button>
                  <button className="bp3-button bp3-intent-dismiss" onClick={() => this.setState({popoverid: false})}>Cancel</button>
                </div>
              </Popover>
              }
              </React.Fragment>
              // normal cell with a button
              : <Button
                onClick={this.clickCell.bind(this, cell)}
                namespace="cms"
                fontSize="xxs"
                iconPosition="left"
                fill
              >
                add image
              </Button>;
          }
        });
        displayColumns.push({
          id: `meta (${localeDefault})`,
          Header: this.renderHeader(localeSecondary ? `${localeDefault} image description` : "image description"),
          minWidth: this.columnWidths("meta"),
          accessor: d => {
            const content = d.image ? d.image.content.find(c => c.locale === localeDefault) : null;
            return content ? content.meta : null;
          },
          Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", localeDefault) : this.renderCell(cell)
        });
        if (localeSecondary) {
          displayColumns.push({
            id: `meta (${localeSecondary})`,
            Header: this.renderHeader(`${localeSecondary} image description`),
            minWidth: this.columnWidths("meta"),
            accessor: d => {
              const content = d.image ? d.image.content.find(c => c.locale === localeSecondary) : null;
              return content ? content.meta : null;
            },
            Cell: cell => cell.original.image ? this.renderEditable.bind(this)(cell, "meta", localeSecondary) : this.renderCell(cell)
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
            Header: this.renderHeader(`${localeSecondary ? `${localeDefault} ` : ""}${prop}`),
            minWidth: this.columnWidths(prop),
            accessor: d => {
              const content = d.content.find(c => c.locale === localeDefault);
              return content ? content[prop] : null;
            },
            Cell: cell => prop !== "name" ? this.renderEditable.bind(this)(cell, prop, localeDefault) : this.renderCell(cell)
          });
          if (localeSecondary) {
            columnGroup.push({
              id: `${prop} (${localeSecondary})`,
              Header: this.renderHeader(`${localeSecondary} ${prop}`),
              minWidth: this.columnWidths(prop),
              accessor: d => {
                const content = d.content.find(c => c.locale === localeSecondary);
                return content ? content[prop] : null;
              },
              Cell: cell => prop !== "name" ? this.renderEditable.bind(this)(cell, prop, localeSecondary) : this.renderCell(cell)
            });
          }
        });
      }
      else if (field === "id") {
        idColumns.push({
          id: field,
          Header: this.renderHeader("id"),
          minWidth: this.columnWidths("id"),
          accessor: d => d.id
        });

        /*
        displayColumns.push({
          id: `${field}-url`,
          Header: this.renderHeader("preview link"),
          minWidth: this.columnWidths("preview"),
          accessor: d => this.linkify.bind(this)(d),
          Cell: cell => <ul className="cms-meta-table-list">
            {cell.value.map((url, i) =>
              <li className="cms-meta-table-item" key={`${url}-${i}`}>
                <a className="cms-meta-table-link u-font-xxs" href={url}>{url}</a>
              </li>
            )}
          </ul>
        });
        */
      }
      else {
        let columnGroup = idColumns;
        if (field === "zvalue") columnGroup = searchColumns;
        if (field === "dimension" || field === "hierarchy") columnGroup = classColumns;
        columnGroup.push(this.renderColumn(field));
      }
    });
    this.setState({data, columns}, this.processFiltering.bind(this));
  }

  /**
   * Hit the search endpoint for all possible members, all locales, and their image meta
   * Use this to popluate the filtering dropdowns, and set sourceData to the pure payload.
   * Then call prepData to turn the sourceData into columns for the table.
   */
  hitDB() {
    const searchGet = axios.get("/api/search?q=&locale=all");
    const metaGet = axios.get("/api/cms/meta");
    Promise.all([searchGet, metaGet]).then(resp => {
      const sourceData = resp[0].data;
      const metaData = resp[1].data;
      const cubes = [...new Set([...metaData.map(d => d.cubeName)])];
      const dimensions = {};
      metaData.forEach(meta => {
        if (!dimensions[meta.dimension]) {
          dimensions[meta.dimension] = meta.levels;
        }
        else {
          dimensions[meta.dimension] = [...new Set([...dimensions[meta.dimension], ...meta.levels])];
        }
      });
      this.setState({cubes, dimensions, sourceData, metaData, pageLoading: false}, this.prepData.bind(this));
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
    const {filterBy, currentCube} = this.state;
    const split = filterBy.split("_");
    const dimension = split[1];
    const hierarchy = split[3];
    // The user may have clicked either a dimension or a hierarchy. Determine which.
    const filterKey = hierarchy ? "hierarchy" : "dimension";
    let url = "/api/search?locale=all&limit=500";
    if (query) {
      url += `&q=${query}`;
    }
    if (currentCube !== "all") {
      url += `&cubeName=${currentCube}`;
    }
    if (filterBy !== "all") {
      if (dimension) url += `&dimension=${dimension}`;
      if (hierarchy) url += `&levels=${hierarchy}`;
    }
    this.setState({querying: true});
    axios.get(url).then(resp => {
      const data = this.fetchStringifiedSourceData.bind(this)(resp.data);
      const page = 0;
      this.setState({data, filterKey, page, querying: false});
    });

  }

  resetFiltering() {
    this.setState({query: "", filterBy: "all", filterKey: "dimension"}, this.processFiltering.bind(this));
  }
  resetQuery() {
    this.setState({query: ""}, this.processFiltering.bind(this));
  }

  selectPaginationSize(e) {
    this.setState({pageSize: e.target.value});
  }

  onChooseCube(e) {
    const currentCube = e.target.value;
    this.setState({currentCube}, this.processFiltering.bind(this));
  }

  onChange(field, e) {
    if (field === "query") {
      let typingTimeout = null;
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      typingTimeout = setTimeout(this.processFiltering.bind(this), 750);
      this.setState({typingTimeout, [field]: e.target.value});
    }
    else {
      this.setState({[field]: e.target.value}, this.processFiltering.bind(this));
    }
  }

  closeEditor() {
    this.setState({url: "", flickrImages: [], isOpen: false, dialogMode: "direct", loading: false, imgIndex: 0, selectedFile: false});
  }

  handleUploadChange(e) {
    const selectedFile = e.target.files[0];
    this.setState({selectedFile});
  }

  uploadFile(e) {
    e.preventDefault();
    const {selectedFile, currentRow} = this.state;
    const {contentId} = currentRow;
    const Toast = this.context.toast.current;
    if (!selectedFile) {
      Toast.show({
        intent: "danger",
        message: "No File Selected!",
        timeout: 2000
      });
    }
    else {
      const url = "/api/image/upload";
      const config = {headers: {"Content-Type": "multipart/form-data"}};
      const data = new FormData();
      data.append("imgFile", selectedFile);
      data.append("contentId", contentId);
      this.setState({loading: true});
      const doneState = {url: "", flickrImages: [], isOpen: false, loading: false, imgIndex: 0, selectedFile: false, epoch: new Date().getTime()};
      axios.post(url, data, config).then(resp => {
        this.setState(doneState, this.prepData.bind(this));
        if (resp.data.error) {
          Toast.show({
            intent: "danger",
            message: `Upload Error - ${resp.data.error}`,
            timeout: 2000
          });
        }
        else if (resp.data === "OK") {
          Toast.show({
            intent: "success",
            message: "Upload Complete!",
            timeout: 2000
          });
        }
        else {
          Toast.show({
            intent: "danger",
            message: "Unknown Upload Error!",
            timeout: 2000
          });
        }
      }).catch(e => {
        this.setState(doneState, this.prepData.bind(this));
        Toast.show({
          intent: "danger",
          message: `Upload Error - ${e.message}`,
          timeout: 2000
        });
      });
    }
  }

  render() {
    const {
      columns,
      cubes,
      currentCube,
      currentRow,
      data,
      dialogMode,
      dimensions,
      imageEnabled,
      cloudEnabled,
      query,
      epoch,
      filterBy,
      filterKey,
      flickrQuery,
      flickrImages,
      isOpen,
      loading,
      pageLoading,
      pageIndex,
      pageSize,
      querying,
      searching,
      imgIndex,
      url
    } = this.state;

    // custom pagination buttons
    const paginationButtonProps = {
      className: "cms-meta-pagination-button",
      fontSize: "xxs",
      iconOnly: true,
      namespace: "cms"
    };
    const PreviousComponent = props =>
      <Button icon="arrow-left" {...paginationButtonProps} {...props}>
        Go to previous page in table
      </Button>;
    const NextComponent = props =>
      <Button icon="arrow-right" {...paginationButtonProps} {...props}>
        Go to next page in table
      </Button>;

    return (
      <div className="cms-panel meta-editor">
        <div className="cms-sidebar cms-meta-header">
          <div className="cms-meta-header-inner">
            <h2 className="cms-meta-header-heading u-margin-top-off u-font-xs">Filters</h2>
            <Button
              className="cms-meta-header-button"
              onClick={this.resetFiltering.bind(this)}
              disabled={query === "" && filterBy === "all"}
              namespace="cms"
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
                namespace="cms"
                fontSize="xs"
              />

              <Select
                label={filterKey === "dimension" ? "Dimension" : "Hierarchy"}
                inline
                fontSize="xs"
                namespace="cms"
                value={filterBy}
                onChange={this.onChange.bind(this, "filterBy")}
              >
                <option key="all" value="all">All</option>
                {Object.keys(dimensions).map(dim =>
                  <optgroup key={dim} label={dim}>
                    {/* show the dimension as the first option in each group */}
                    <option key={`dimension_${dim}`} value={`dimension_${dim}`}>{dim}</option>
                    {/* Show indented hierarchies */}
                    {dimensions[dim].map(hierarchy =>
                      !dimensions[dim].includes(dim) || dimensions[dim].length !== 1
                        ? <option key={`dimension_${dim}_hierarchy_${hierarchy}`} value={`dimension_${dim}_hierarchy_${hierarchy}`}>   {hierarchy}</option>
                        : ""
                    )}
                  </optgroup>

                )}
              </Select>

              <Select
                label="Cube (optional)"
                inline
                fontSize="xs"
                namespace="cms"
                value={currentCube}
                onChange={this.onChooseCube.bind(this)}
              >
                <option key="all" value="all">All</option>
                {cubes.map(cube => <option key={cube} value={cube}>{cube}</option>)}
              </Select>

              <Select
                label="Number of rows"
                inline
                fontSize="xs"
                namespace="cms"
                value={pageSize}
                onChange={e => this.selectPaginationSize(e)}
                options={[ROWS_PER_PAGE, 25, 50, 100]}
              />
            </div>
          </div>
          <div className="cms-img-status-box">{`Flickr ${imageEnabled ? "enabled" : "disabled"}, Cloud ${cloudEnabled ? "enabled" : "disabled"}`}</div>
        </div>

        <div className="cms-editor cms-meta-table-container">
          <h2 className="u-visually-hidden">Members</h2>
          <ReactTable
            page={pageIndex}
            onPageChange={pageIndex => this.setState({pageIndex})}
            className="cms-meta-table"
            data={data}
            columns={columns}
            pageSize={pageSize < data.length ? pageSize : data.length}
            onPageSizeChange={(pageSize, pageIndex) => this.setState({pageSize, pageIndex})}
            showPagination={data.length > pageSize}
            PreviousComponent={PreviousComponent}
            NextComponent={NextComponent}
            showPageSizeOptions={false}
            noDataText={pageLoading ? "Loading data…" : "No data found"}
          />
        </div>

        <Dialog
          className={`cms-meta-popover${flickrImages.length > 0 ? " cms-gallery-popover" : ""}`}
          isOpen={isOpen}
          onClose={this.closeEditor.bind(this)}
          title={dialogMode === "direct"
            ? currentRow.imageId ? "Current image" : "Flickr URL"
            : "Search Flickr"
          }
          headerControls={
            // tab between direct & search modes
            <ButtonGroup className="cms-meta-popover-button-group" namespace="cms">
              <Button
                active={dialogMode === "direct"}
                fontSize="xs"
                namespace="cms"
                icon="link"
                iconPosition="left"
                onClick={() => this.setState({dialogMode: "direct"})}
              >
                direct link
              </Button>
              <Button
                active={dialogMode === "search"}
                fontSize="xs"
                namespace="cms"
                icon="search"
                iconPosition="left"
                onClick={() => this.setState({dialogMode: "search"})}
              >
                search
              </Button>
              <Button
                active={dialogMode === "upload"}
                fontSize="xs"
                namespace="cms"
                icon="upload"
                iconPosition="left"
                onClick={() => this.setState({dialogMode: "upload"})}
              >
                upload
              </Button>
            </ButtonGroup>
          }
        >

          {dialogMode === "direct" &&
            // paste in a URL
            <Fragment>
              {url.includes("custom-image") && <p className="u-font-xxs">Note: this is a custom image upload and has no URL permalink. If you wish to set a new image via Flickr, set its URL here.</p>}
              <TextButtonGroup
                className="u-margin-bottom-md"
                namespace="cms"
                inputProps={{
                  label: "Flickr direct link",
                  placeholder: "https://flickr.com/url",
                  value: url,
                  onChange: e => this.setState({url: e.target.value}),
                  namespace: "cms",
                  labelHidden: true,
                  autoFocus: true
                }}
                buttonProps={{
                  onClick: this.save.bind(this, currentRow, url.replace("https://flic.kr/p/", ""), null),
                  namespace: "cms",
                  children: currentRow.imageId ? "update" : "submit"
                }}
              />

              <div className="cms-meta-selected-img-wrapper">
                {currentRow.imageId && currentRow.dimension && currentRow.id && currentRow.cubeName
                  ? <img
                    className="cms-meta-selected-img"
                    src={`/api/image?dimension=${currentRow.dimension}&cubeName=${currentRow.cubeName}&id=${currentRow.id}&level=${currentRow.hierarchy}&size=thumb&t=${epoch}`}
                    alt=""
                    draggable="false"
                  />
                  : <div className="cms-meta-selected-img-error">
                    <p className="cms-meta-selected-img-error-text">
                      No image associated with this profile.
                      <Button
                        className="u-margin-top-xs"
                        onClick={() => this.setState({dialogMode: "search"})}
                        namespace="cms"
                        fill
                      >
                        Search Flickr
                      </Button>
                    </p>
                  </div>
                }
              </div>
            </Fragment>
          }

          { dialogMode === "search" &&
            // search Flickr
            <Fragment>
              <TextButtonGroup
                namespace="cms"
                inputProps={{
                  label: "Flickr image search",
                  placeholder: "Search Flickr images",
                  value: flickrQuery,
                  onChange: e => this.setState({flickrQuery: e.target.value}),
                  namespace: "cms",
                  labelHidden: true,
                  autoFocus: true,
                  disabled: searching
                }}
                buttonProps={{
                  onClick: this.searchFlickr.bind(this),
                  namespace: "cms",
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
                        namespace="cms"
                        fill
                      >
                        load more
                      </Button>
                    }
                  </div>
              }
            </Fragment>
          }
          { dialogMode === "upload" &&
            <Fragment>
              <form onSubmit={this.uploadFile.bind(this)}>
                <input type="file" className="form-control" name="imgFile" onChange={this.handleUploadChange.bind(this)} />
                <button type="submit" className="btn btn-dark">Save</button>
              </form>
            </Fragment>
          }
        </Dialog>
        <Status busy="Searching..." done="Complete!" recompiling={querying}/>
      </div>
    );
  }
}

MetaEditor.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  env: state.env,
  status: state.cms.status
});

export default connect(mapStateToProps)(MetaEditor);
