import React from 'react';
import {observer} from "mobx-react";
import {compose} from "recompose";
import {withStyles, createStyles, Theme} from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Toolbar from "@material-ui/core/Toolbar";
import LinearProgress from "@material-ui/core/LinearProgress";
import Paper from "@material-ui/core/Paper";
// @ts-ignore
import classNames from "classnames";

import {AboutButton} from "../components/About";
import ErrorSnackbar from "../components/ErrorSnackbar";
import CytoscapeLayout from "./CytoscapeLayout/CytoscapeLayout";
import GraphEmpty from "./GraphView/GraphEmpty";
import GraphView from "./GraphView/GraphView";
import QueryHistory from "./QueryHistory/QueryHistory";
import RefineryOptions from "./RefineryOptions/RefineryOptions";
import MainPageStore from "./MainPageStore";
import Search from './Search/Search';
import Table from "./Table/Table";
import Divider from "@material-ui/core/Divider";
import Details from "./Details/Details";

const drawerWidth = 360;
const infoDrawerWidth = 360;

const styles = (theme: Theme) => {
    const appBarHeight = theme.spacing.unit * 8;
    return createStyles({
        root: {
            height: '100vh',
            zIndex: 1,
            overflow: 'hidden'
        },
        appFrame: {
            position: 'relative',
            display: 'flex',
            width: '100%',
            height: '100%'
        },
        appBar: {
            position: 'absolute',
            height: appBarHeight,
            width: '100%',

            // Make sure appbar is on top
            // Drawer z-index is 1301
            // Need to change strategy if we want other drawers to come on top
            zIndex: 1301
        },
        appBarLeft: {
            display: 'flex',
            flexGrow: 1
        },
        appBarLogo: {
            height: 46,
            maxWidth: 'none'
        },

        drawerDocked: {},
        drawerPaper: {
            position: 'relative',
            marginTop: appBarHeight,
            height: `calc(100% - ${appBarHeight}px)`,
            width: drawerWidth,
            backgroundColor: '#FAFAFA'
        },
        content: {
            position: 'relative',
            marginTop: appBarHeight,
            height: `calc(100% - ${appBarHeight}px)`,
            width: '100%',

            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen
            })
        },

        infoDrawerDocked: {},
        infoDrawerPaper: {
            position: 'relative',
            marginTop: appBarHeight,
            height: `calc(100% - ${appBarHeight}px)`,
            width: infoDrawerWidth
        },
        inforDrawerRoot: {
            height: '100%',
            position: 'relative'
        },

        //
        paper: {
            padding: theme.spacing.unit * 2,
            marginLeft: theme.spacing.unit * 2,
            marginRight: theme.spacing.unit * 2,
            marginTop: theme.spacing.unit * 2
        },
        paperNoPadding: {
            marginLeft: theme.spacing.unit * 2,
            marginRight: theme.spacing.unit * 2,
            marginTop: theme.spacing.unit * 2
        }
    });
};

const store = new MainPageStore();
store.initByUrl(window.location);

const MainPage = ({classes} : {classes: any}) => (

    <div className={classes.root}>
        <div className={classes.appFrame}>
            {/* Header */}
            <div className={classes.appBar}>
                <AppBar position='static'>
                    <Toolbar>
                        <div className={classes.appBarLeft}>
                            <a href='/'>
                                <img
                                    src='/act-logo-onDark.svg'
                                    alt='ACT'
                                    className={classes.appBarLogo}
                                />
                            </a>
                        </div>
                        <Button color='inherit' component='a' href='/examples'>
                            Examples
                        </Button>
                        <AboutButton/>
                    </Toolbar>
                    {(store.backendStore.isLoading) && (
                        <LinearProgress variant='query' color='secondary'/>
                    )}
                </AppBar>
            </div>

            {/* Drawer */}
            <Drawer
                variant='permanent'
                classes={{paper: classes.drawerPaper, docked: classes.drawerDocked}}>
                {/* Search Form */}
                <Paper className={classes.paper}>
                    <Search store={store.ui.searchStore}/>
                </Paper>

                {/* Data navigation */}
                {!store.queryHistory.isEmpty && (
                    <Paper className={classes.paperNoPadding}>
                        <QueryHistory store={store.ui.queryHistoryStore}/>
                    </Paper>
                )}

                {/* View options */}
                <Paper className={classes.paper}>
                    <CytoscapeLayout store={store.ui.cytoscapeLayoutStore}/>
                </Paper>

                <Paper className={classes.paper}>
                    <RefineryOptions store={store.ui.refineryOptionsStore}/>
                </Paper>
            </Drawer>

            {/* Graph */}
            <main className={classNames(classes.content)}>
                {!store.queryHistory.isEmpty ? (
                    <GraphView store={store.ui.cytoscapeStore}/>
                ) : (
                    <GraphEmpty/>)
                }
            </main>

            {/* Info drawer */}
            {!store.queryHistory.isEmpty && (
                <Drawer
                    variant='permanent'
                    anchor='right'
                    classes={{
                        paper: classes.infoDrawerPaper,
                        docked: classes.infoDrawerDocked
                    }}>

                    <div className={classes.inforDrawerRoot}>
                        <Details store={store.ui.detailsStore} />
                        <Divider/>
                        <Table store={store.ui.tableStore} />
                    </div>
                </Drawer>
            )}
        </div>

        <ErrorSnackbar error={store.backendStore.error} />
    </div>
);

export default compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(MainPage);