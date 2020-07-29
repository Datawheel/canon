import React, {Component} from "react";
import "intersection-observer";
import Observer from "@researchgate/react-intersection-observer";

class LazyImage extends Component {

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
    const {imageProps, observerProps, backgroundImage, children} = this.props;
    const {intersected} = this.state;

    const wrapperStyle = {};

    if (backgroundImage) {
      wrapperStyle.backgroundImage = intersected ? `url(${imageProps.src})` : "";
    }

    return (
      <Observer {...observerProps} onChange={this.handleIntersection}>
        <div className={`canon-lazy-image-wrapper ${imageProps.className}`} style={wrapperStyle}>
          {backgroundImage && <>{children}</> }
          {!backgroundImage && <img className={`canon-lazy-image-img ${imageProps.className}-img`} src={intersected ? imageProps.src : ""} alt={imageProps.alt} /> }
        </div>
      </Observer>
    );
  }

  // Set default props
  static defaultProps = {
    backgroundImage: false,
    imageProps: {
      src: "",
      className: "",
      alt: ""
    },
    observerProps: {
      root: undefined,
      rootMargin: undefined,
      threshold: 0,
      disabled: false
    }
  };

}

export {LazyImage};
