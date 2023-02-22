export default function Mirror({inUse}) {
    return (
      <div className={`mirror ${inUse ? "is-visible" : "is-hidden"}`} aria-hidden="true">
        <div className="mirror-inner">
          <div className="mirror-content">
            <div className="mirror-content-inner" />
          </div>
          <div className="mirror-footer">
            <div className="mirror-footer-text">
              <p className="mirror-footer-text-description u-font-sm" aria-hidden="true" />
              <p className="mirror-footer-text-url u-font-xxs u-margin-bottom-off" aria-hidden="true" />
            </div>
            <div className="mirror-footer-logo" />
          </div>
        </div>
      </div>
    );
};