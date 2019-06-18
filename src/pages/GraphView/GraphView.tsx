import React from "react";
import CytoscapeContainer from "../../Cytoscape/Cytoscape";
import {observer} from "mobx-react";
import GraphViewStore from "./GraphViewStore";
import {createStyles, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import WarnIcon from '@material-ui/icons/Warning';
import {compose} from "recompose";
import Button from "@material-ui/core/Button";

const styles = (theme : Theme)  => createStyles({
    warning: {
        padding: "20px",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },

    warningButton: {
      paddingTop: "20px"
    }
});


const RenderWarning = ({classes, onClick} : {classes: any, onClick : Function}) => (
    <div className={classes.warning}>
        <WarnIcon color="secondary" style={{fontSize: 90}}/>
        <Typography variant="h2">Large result set</Typography>
        <Typography variant="h5">Please adjust your queries to see the graph</Typography>
        <div className={classes.warningButton}>
            <Button variant="outlined"
                    size="large"
                    onClick={() => onClick()}>
                I want to try anyway
            </Button>
        </div>
    </div>
);

const GraphView = ({store, classes}: IGraphView) => {

    if (store.prepared.canRender) {
        return <CytoscapeContainer {...store.prepared}/>;
    } else {
        return <RenderWarning classes={classes} onClick={() => store.acceptRenderWarningOnClick()}/>;
    }
};

interface IGraphView extends WithStyles<typeof styles> {
    store: GraphViewStore
}

export default compose<IGraphView, any>(
    withStyles(styles),
    observer
)(GraphView);

