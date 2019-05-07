import React from "react";
import TableStore from "./TableStore";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {observer} from "mobx-react";
import {withStyles, createStyles, Theme} from "@material-ui/core"
import {compose} from "recompose";
import ActObjectsTable from "../../components/ActObjectsTable";
import {ActFact, ActObject} from "../QueryHistory";
import ActFactsTable from "../../components/ActFactsTable";

const nodeInformationHeight = 480;
const styles = (theme: Theme) => createStyles({
    table: {
        position: 'relative',
        // Subtract height from info box, tab, and divider
        height: `calc(100% - ${nodeInformationHeight}px - ${theme.spacing.unit * 6}px - 1px)`,
        overflowY: 'scroll'
    }
});

const Table = ({store, classes}: { store: TableStore, classes: any}) => (
    <>
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
                           onRowClick={(fact: ActFact) => {
                               store.setSelectedFact(fact)
                           }}/>}
        </div>
    </>
);

export default compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(Table);

