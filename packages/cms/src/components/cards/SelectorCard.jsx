import axios from "axios";
import React, {Component} from "react";
import {Card, Dialog} from "@blueprintjs/core";
import Loading from "components/Loading";
import FooterButtons from "../FooterButtons";
import SelectorEditor from "../editors/SelectorEditor";
import PropTypes from "prop-types";
import "./SelectorCard.css";

/**
 * Card Component for displaying dropdown selectors. Selectors may be singular dropdowns
 * or multiselects
 */
class SelectorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  /**
   * Note that unlike all other cards, the SelectorCard actually has ALL its data from 
   * the start, passed down in props. This was chosen so that the list of options could
   * be shown on the front of the card. Now that Selectors have titles, it may make sense
   * to change this to behave like all other cards, i.e., Fetch their own data on mount
   */
  componentDidMount() {
    this.setState({minData: this.props.minData});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.minData !== this.props.minData) {
      this.setState({minData: this.props.minData});
    }
  }

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    // In SelectorEditor, we use an "isDefault" property to assist with managing 
    // checkbox states. Before we save the data to the db, remove that helper prop
    minData.options = minData.options.map(o => {
      delete o.isDefault;
      return o;
    });
    axios.post(`/api/cms/${type}/update`, minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onSave) this.props.onSave();
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
    const {minData, isOpen} = this.state;
    const {variables} = this.props;

    if (!minData) return <Loading />;

    return (
      <Card className="splash-card" key={minData.id} onClick={() => this.setState({isOpen: true})} interactive={true} elevation={1}>
        <Dialog
          className="generator-editor-dialog"
          iconName="code"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Selector Editor"
        >
          <div className="pt-dialog-body">
            <SelectorEditor variables={variables} data={minData} />
          </div>
          <FooterButtons
            onDelete={this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
        <h4>{minData.title}</h4>
        <h6>{minData.name}</h6>

        <ul>
          {minData.options && minData.options.map(o =>
            <li key={o.option} className={minData.default === o.option ? "is-default" : ""}>{o.option}</li>
          )}
        </ul>
      </Card>
    );
  }

}

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

export default SelectorCard;
