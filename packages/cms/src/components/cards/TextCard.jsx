import axios from "axios";
import React, {Component} from "react";
import {Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../utils/varSwapRecursive";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import MoveButtons from "../MoveButtons";
import TextEditor from "../editors/TextEditor";
import PlainTextEditor from "../editors/PlainTextEditor";
import PropTypes from "prop-types";
import "./TextCard.css";

class TextCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      displayData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && (prevProps.variables !== this.props.variables || this.props.selectors !== prevProps.selectors)) {
      this.formatDisplay.bind(this)();
    }
    if (prevProps.item.id !== this.props.item.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    const {item, type} = this.props;
    const {id} = item;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, selectors} = this.props;
    const {formatters} = this.context;
    const {minData} = this.state;
    // Setting "selectors" here is pretty hacky. The varSwap needs selectors in order
    // to run, and it expects them INSIDE the object. Find a better way to do this without
    // polluting the object itself
    minData.selectors = selectors;
    const displayData = varSwapRecursive(minData, formatters, variables);
    this.setState({displayData});
  }

  save() {
    const {type, fields, plainfields} = this.props;
    const {minData} = this.state;
    const payload = {id: minData.id};
    // For some reason, an empty quill editor reports its contents as <p><br></p>. Do not save 
    // this to the database - save an empty string instead.
    fields.forEach(field => payload[field] = minData[field] === "<p><br></p>" ? "" : minData[field]);
    if (plainfields) plainfields.forEach(field => payload[field] = minData[field] === "<p><br></p>" ? "" : minData[field]);
    payload.allowed = minData.allowed;
    axios.post(`/api/cms/${type}/update`, payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false}, this.formatDisplay.bind(this));
        if (this.props.onSave) this.props.onSave(minData);
      }
    });
  }

  delete() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.delete(`/api/cms/${type}/delete`, {params: {id: minData.id}}).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onDelete) this.props.onDelete(type, resp.data);
      }
    });
  }

  render() {
    const {displayData, minData, isOpen} = this.state;
    const {variables, fields, plainfields, type, parentArray, item} = this.props;
    const {ordering} = item;

    if (!minData || !displayData) return <Loading />;

    let cardClass = "splash-card";
    if (["profile_stat", "topic_stat"].includes(type)) cardClass = "stat-card";
    const displaySort = ["title", "value", "subtitle"];
    const displays = Object.keys(displayData)
      .filter(k => typeof displayData[k] === "string" && !["id", "image", "profile_id", "allowed", "ordering", "slug", "label", "type"].includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b));

    return (
      <div className={`cms-card cms-${cardClass}`}>

        {/* title & edit toggle button */}
        <h5 className="cms-card-header">
          <button className="cms-button" onClick={() => this.setState({isOpen: true})}>
            Edit <span className="pt-icon pt-icon-cog" />
          </button>
        </h5>

        { type === "story_footnote" || type === "profile_footnote" &&
          <div>
            Use Footnote Reference: <strong>{`Foot{{${ordering + 1}}}`}</strong>
          </div>
        }

        { displays.map((k, i) =>
          <p key={i} className={k} dangerouslySetInnerHTML={{__html: displayData[k]}} />
        )}

        {/* reorder buttons */}
        { parentArray &&
          <MoveButtons
            item={item}
            array={parentArray}
            type={type}
            onMove={this.props.onMove ? this.props.onMove.bind(this) : null}
          />
        }

        <Dialog
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Text Editor"
          inline="true"
        >
          <div className="pt-dialog-body">
            <PlainTextEditor data={minData} fields={plainfields} />
            <TextEditor data={minData} variables={variables} fields={fields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))} />
          </div>
          <FooterButtons
            onDelete={["profile", "section", "topic"].includes(type) ? false : this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
      </div>
    );
  }

}

TextCard.contextTypes = {
  formatters: PropTypes.object
};

export default TextCard;
