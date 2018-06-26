import {Cube} from "mondrian-rest-client";
import Dimension, {Level} from "mondrian-rest-client/lib/types/dimension";
import Measure from "mondrian-rest-client/lib/types/measure";
import { IVizbuilderState, IVizbuilderProps } from "./typings/state";

declare module "@datawheel/vizbuilder" {
  export class Vizbuilder extends React.Component<
    IVizbuilderProps,
    IVizbuilderState
  > {
    state: IVizbuilderState;
    constructor(props: IVizbuilderProps);
    getChildContext(): any;
    shouldComponentUpdate(nextProps): boolean;
    componentDidUpdate(prevProps, prevState): void;
    render(): JSX.Element;
  }
}
