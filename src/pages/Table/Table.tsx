import React from "react";
import TableStore from "./TableStore";
import ObjectInformation from "../../components/ObjectInformation/ObjectInformation";
import FactInformation from "../../components/FactInformation/FactInformation";
import Divider from "@material-ui/core/Divider";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {observer} from "mobx-react";
import withStyles from "@material-ui/core/styles/withStyles";
import {compose} from "recompose";
import ActObjectsTable from "../../components/ActObjectsTable";
import {ActFact, ActObject} from "../QueryHistory";
import ActFactsTable from "../../components/ActFactsTable";

const nodeInformationHeight = 480;
// @ts-ignore
const styles = theme => ({
    root: {
        height: '100%',
        position: 'relative'
    },
    nodeInformation: {
        position: 'relative',
        height: nodeInformationHeight,
        overflowY: 'scroll'
    },
    table: {
        position: 'relative',
        // Subtract height from info box, tab, and divider
        height: `calc(100% - ${nodeInformationHeight}px - ${theme.spacing.unit *
        6}px - 1px)`,
        overflowY: 'scroll'
    }
});

const Table = ({store, classes} : {store: TableStore, classes: any}) => (

    <div className={classes.root}>
        {/* Node info */}
        <div className={classes.nodeInformation}>
            {store.selectedNode.id !== null &&
            (store.selectedNode.type === 'object' ? (
                <ObjectInformation
                    id={store.selectedNode.id}
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

        <Divider/>
        {/* Objects table */}
        <Tabs
            value={store.selectedTab}
            onChange={(e, value) => store.setSelectedTab(value)}
            indicatorColor='primary'>
            <Tab
                label={`Objects (${store.objects.length})`}
                value='objects'/>
            <Tab
                label={`Facts (${store.facts.length})`}
                value='facts'/>
        </Tabs>

        <div className={classes.table}>
            {store.selectedTab === 'objects' &&
            <ActObjectsTable objects={store.objects}
                             selectedNode={store.selectedNode}
                             onRowClick={(actObject: ActObject) => {
                                 store.setSelectedObject(actObject)
                             }}/>}
            {store.selectedTab === 'facts' &&
            <ActFactsTable facts={store.facts}
                           selectedNode={store.selectedNode}
                           onRowClick={ (fact: ActFact) => {store.setSelectedFact(fact)
                           }}/>}
        </div>
    </div>
);

export default compose(
    // @ts-ignore
    withStyles(styles),
    observer
    // @ts-ignore
)(Table);

