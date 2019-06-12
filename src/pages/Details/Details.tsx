import React from "react";
import {observer} from "mobx-react";
import {withStyles, createStyles, Theme} from "@material-ui/core"
import {compose} from "recompose";

import ObjectInformation from "../../components/ObjectInformation/ObjectInformation";
import FactInformation from "../../components/FactInformation/FactInformation";
import DetailsStore from "./DetailsStore";
import {ActFact, ActObject} from "../types";


const styles = (theme : Theme)  => createStyles({
    nodeInformation: {
        position: 'relative',
        overflowY: 'scroll',
        height: "100%"
    }
});

const Details = ({store, classes} : {store: DetailsStore, classes: any}) => {
    if (!store.hasSelection) {
        return null;
    }

    const detailsComp = store.selectedObject ?
        <ObjectInformation {...store.selectedObjectDetails}/> :
        <FactInformation id={store.selectedNode.id}
                         endTimestamp={store.endTimestamp}
                         onObjectRowClick={(object: ActObject) => store.setSelectedObject(object)}
                         onFactRowClick={(fact: ActFact) => store.setSelectedFact(fact)}
                         selectedNode={store.selectedNode}/>;

    return (<div className={classes.nodeInformation}>
        {detailsComp}
    </div>);
};

export default compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(Details);
