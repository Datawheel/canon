import React, {Component} from "react";
import Observer from "@researchgate/react-intersection-observer";

class LazyImageBg extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intersected: false
    };
    this.handleIntersection = this.handleIntersection.bind(this);
  }

  handleIntersection(event) {
    if (!this.state.intersected && event.isIntersecting) {
      this.setState({intersected: true});
    }
  }

  render() {
    const {root, rootMargin, bgSrc, children, itemClassName} = this.props;
    const {intersected} = this.state;

    const bgStyle = intersected ? `url(${bgSrc})` : "";

    const options = {
      onChange: this.handleIntersection,
      root,
      rootMargin
    };

    return (
      <Observer {...options}>
        <div className={itemClassName} style={{backgroundImage: bgStyle}}>
          {children}
        </div>
      </Observer>
    );
  }

}

LazyImageBg.defaultProps = {
  bgSrc: "",
  root: undefined,
  rootMargin: undefined,
  itemClassName: "canon-lazy-image-bg"
};
export {LazyImageBg};
