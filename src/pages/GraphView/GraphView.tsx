import React from "react";
import CytoscapeContainer from "../../Cytoscape/Cytoscape";
import {observer} from "mobx-react";
import GraphViewStore from "./GraphViewStore";

const GraphView = ({store}: { store: GraphViewStore }) => (
    <CytoscapeContainer {...store.prepared}/>
);

export default observer(GraphView);

