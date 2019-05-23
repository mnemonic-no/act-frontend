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
    return <div className={classes.nodeInformation}>
        {store.selectedNode.id !== null &&
        (store.selectedNode.type === 'object' ? (
            <ObjectInformation
                id={store.selectedNode.id}
                objectDetails={store.selectedObjectDetails}
                {...{onSearchSubmit: (data : any) => store.onSearchSubmit(data)}}
            />
        ) : (
            <FactInformation id={store.selectedNode.id}
                             endTimestamp={store.endTimestamp}
                             onObjectRowClick={ (object : ActObject) => store.setSelectedObject(object) }
                             onFactRowClick={ (fact : ActFact ) => store.setSelectedFact(fact)}
                             selectedNode={store.selectedNode}/>
        ))}
    </div>
};

export default compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(Details);
