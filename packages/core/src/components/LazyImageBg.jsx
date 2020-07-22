import React, {Component} from "react";
import {wrap, proxy} from "comlink";
import "intersection-observer";
import Observer from "@researchgate/react-intersection-observer";

// @ts-ignore
import LoadImageWorker from "./../actions/loadImage.worker.js";

class LazyImageBg extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intersected: false,
      isSSR: typeof window === "undefined",
      imageWorker: false,
      blobURL: false
    };
    this.handleIntersection = this.handleIntersection.bind(this);
  }

  handleIntersection(event) {
    const {intersected, isSSR} = this.state;
    const {bgSrc} = this.props;
    if (!intersected && event.isIntersecting) {
      const imageWorker = isSSR ? false : wrap(new LoadImageWorker());
      this.launchWorker(imageWorker, bgSrc, data => {
        if (data) {
          const objectURL = URL.createObjectURL(data);
          this.setState({intersected: true, imageWorker, blobURL: objectURL}, () => {
            this.revokeURL(objectURL);
          });
        }
      });
    }
  }

  revokeURL(objectURL) {
    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 5000);
  }

  async launchWorker(imageWorker, imageUrl, callback) {
    if (imageWorker) {
      // @ts-ignore
      try {
        await imageWorker(proxy(callback), imageUrl);
      }
      catch (error) {
        console.error(error);
        callback(false);
      }
    }
  }

  render() {
    const {root, rootMargin, threshold, disabled, children, itemClassName} = this.props;
    const {intersected, blobURL} = this.state;

    const bgStyle = intersected && blobURL ? `url(${blobURL})` : "";

    const options = {
      onChange: this.handleIntersection,
      root,
      rootMargin,
      threshold,
      disabled
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
  root: undefined,
  rootMargin: undefined,
  threshold: 0,
  disabled: false,
  bgSrc: "",
  itemClassName: "canon-lazy-image-bg"
};
export {LazyImageBg};
