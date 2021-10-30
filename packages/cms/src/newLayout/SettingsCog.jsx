import React, {useState} from "react";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

/**
 *
 */
function SettingsCog({content, renderTarget}) {

  const [showMenu, setShowMenu] = useState(false);

  const onClick = e => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div>
      <Popover2
        key="popover"
        {...popoverProps}
        content={content}
        renderTarget={({ref, ...targetProps}) =>
          renderTarget
            ? renderTarget({...targetProps, elementRef: ref, onClick})
            : <Button key="b3" {...targetProps} elementRef={ref} small={true} onClick={() => setShowMenu(!showMenu)} icon="cog" />
        }
      />
    </div>
  );

}

export default SettingsCog;
