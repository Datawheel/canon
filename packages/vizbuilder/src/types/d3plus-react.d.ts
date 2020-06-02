import {Component} from "react";
import {D3plusConfig} from "./d3plus";

declare module "d3plus-react" {
  export class AreaPlot extends Viz<VizProps> {}
  export class BarChart extends Viz<VizProps> {}
  export class BumpChart extends Viz<VizProps> {}
  export class Donut extends Viz<VizProps> {}
  export class Geomap extends Viz<GeomapProps> {}
  export class LinePlot extends Viz<VizProps> {}
  export class Network extends Viz<NetworkProps> {}
  export class Pack extends Viz<VizProps> {}
  export class Pie extends Viz<VizProps> {}
  export class Plot extends Viz<VizProps> {}
  export class Priestley extends Viz<VizProps> {}
  export class Radar extends Viz<VizProps> {}
  export class Rings extends Viz<VizProps> {}
  export class Sankey extends Viz<VizProps> {}
  export class StackedArea extends Viz<VizProps> {}
  export class Tree extends Viz<VizProps> {}
  export class Treemap extends Viz<VizProps> {}
  export class Viz<T extends VizProps> extends Component<T> {}

  interface VizProps {
    /**
     * An object containing method/value pairs to be passed to the visualization's .config( ) method.
     * Default: {}
     */
    config?: Partial<D3plusConfig>;

    /**
     * A custom formatting function to be used when formatting data from an
     * AJAX request.
     * The function will be passed the raw data returned from the request, and
     * is expected to return an array of values used for the data method.
     */
    dataFormat?: (result: any) => any[]
  }

  interface GeomapProps extends VizProps {
    /**
     * A custom formatting function to be used when formatting topojson from an
     * AJAX request.
     * The function will be passed the raw data returned from the request, and
     * is expected to return an array of values used for the topojson method.
     */
    topojsonFormat?: (result: any) => any[]
  }

  interface NetworkProps extends VizProps {
    /**
     * A custom formatting function to be used when formatting links from an
     * AJAX request.
     * The function will be passed the raw data returned from the request, and
     * is expected to return an array of values used for the links method.
     */
    linksFormat?: (result: any) => any[]

    /**
     * A custom formatting function to be used when formatting nodes from an
     * AJAX request.
     * The function will be passed the raw data returned from the request, and
     * is expected to return an array of values used for the nodes method.
     */
    nodesFormat?: (result: any) => any[]
  }
}
