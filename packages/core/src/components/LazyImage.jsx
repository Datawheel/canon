import React, {Component} from "react";
import "intersection-observer";
import Observer from "@researchgate/react-intersection-observer";

class LazyImage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intersected: false,
      key: Math.random()
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
    const {intersected, key} = this.state;

    const wrapperStyle = {};

    if (backgroundImage) {
      wrapperStyle.backgroundImage = intersected ? `url(${imageProps.src})` : "";
    }

    return (
      <Observer key={`o${key}`} {...observerProps} onChange={this.handleIntersection}>
        <div key={`d${key}`} className={`canon-lazy-image-wrapper ${imageProps.className}`} style={wrapperStyle}>
          {backgroundImage && <>{children}</> }
          {!backgroundImage && <img className={`canon-lazy-image-img ${imageProps.className}-img`} src={intersected ? imageProps.src : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="} alt={imageProps.alt} />}
          <noscript>
            <img className={`canon-lazy-image-img ${imageProps.className}-img`} src={imageProps.src} alt={imageProps.alt} />
          </noscript>
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
