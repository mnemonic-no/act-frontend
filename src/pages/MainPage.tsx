import React, {useState} from 'react';
import {Observer, observer} from "mobx-react";
import {compose} from "recompose";
import {withStyles, createStyles, Theme} from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import LinearProgress from "@material-ui/core/LinearProgress";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Toolbar from "@material-ui/core/Toolbar";
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
import Details from "./Details/Details";
import ObjectsTable from "./Table/ObjectsTable";
import FactsTable from "./Table/FactsTable";
import ErrorBoundary from '../components/ErrorBoundary';


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

        errorBoundary: {
            marginTop: appBarHeight,
            width: "100%"
        },

        appBar: {
            position: 'absolute',
            height: appBarHeight,
            width: '100%',

            // Make sure appbar is on top
            // Drawer z-index is 1200
            // Need to change strategy if we want other drawers to come on top
            zIndex: 1201
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
	    display: 'flex',
	    flexDirection: 'column',

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

const ContentComp = ({store, classes} : {store: MainPageStore, classes : any}) => {

    const [selectedTab, setSelectedTab] = useState("graph");

    return (
        <Observer>
            {() =>
                <main className={classNames(classes.content)}>
                    <Tabs value={selectedTab}
                          onChange={(e: any, value: string) => setSelectedTab(value)}
                          indicatorColor='primary'>
                        <Tab label='Graph' value='graph'/>
                        <Tab label={`Objects (${store.ui.objectsTableStore.objects.length})`} value='tableOfObjects'/>
                        <Tab label={`Facts (${store.ui.factsTableStore.facts.length})`} value='tableOfFacts'/>
                    </Tabs>

                    {selectedTab === 'graph' && <div style={{ flex: "1 0 auto" }}><GraphView store={store.ui.cytoscapeStore}/></div>}
                    {selectedTab === 'tableOfObjects' && <ObjectsTable {...store.ui.objectsTableStore.prepared}/>}
                    {selectedTab === 'tableOfFacts' && <FactsTable {...store.ui.factsTableStore.prepared}/>}
                </main>
            }
        </Observer>
    );
};


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

            <ErrorBoundary className={classes.errorBoundary}>
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

            {/* Content */}
            {
                !store.queryHistory.isEmpty ? (
                    <ContentComp store={store} classes={classes}/>
                ) : (
                    <GraphEmpty/>
                )
            }

            {/* Info drawer */}
            {!store.queryHistory.isEmpty && (
                <Drawer
                    variant='permanent'
                    anchor='right'
                    classes={{
                        paper: classes.infoDrawerPaper,
                        docked: classes.infoDrawerDocked
                    }}>

                    <Details store={store.ui.detailsStore}/>
                </Drawer>
            )}
            </ErrorBoundary>
        </div>

        <ErrorSnackbar error={store.backendStore.error}/>
    </div>
);

export default compose(
    withStyles(styles),
    observer
    // @ts-ignore
)(MainPage);
