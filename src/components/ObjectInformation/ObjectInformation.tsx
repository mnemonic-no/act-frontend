import React from 'react'
import {compose} from 'recompose'
import Typography from '@material-ui/core/Typography/index'
import {withStyles, createStyles, Theme, WithStyles} from "@material-ui/core"
import {darken, lighten} from '@material-ui/core/styles/colorManipulator'
import Button from '@material-ui/core/Button/index'

import config from '../../config'
import withDataLoader from '../../util/withDataLoader'
import memoizeDataLoader from '../../util/memoizeDataLoader'
import CenteredCircularProgress from '../CenteredCircularProgress'
import {objectTypeToColor} from '../../util/utils'
import {ObjectDetails, PredefinedObjectQuery} from "../../pages/Details/DetailsStore";
import PredefinedObjectQueries from "./PredefinedObjectQueries";
import ContextActions from "./ContextActions";
import {factDataLoader, factTypesDataLoader, objectStatsDataLoader} from "../../core/dataLoaders";
import {getObjectLabelFromFact, isOneLeggedFactType, objectValueText} from "../../core/transformers";
import {ActFact, ActObject, FactType, Search} from "../../pages/types";
import FactTypeTable from "./FactTypeTable";
import CreateFactForObjectDialog from "../CreateFactFor/Dialog";
import {observer} from "mobx-react";

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing.unit * 2,
        paddingBottom: 0,
        height: `calc(100% - ${theme.spacing.unit * 3}px)`,
        overflow: 'hidden',
    },
    info: {
        overflowY: 'auto',
        flex: "0 1 auto",
        minHeight: "200px"
    },
    objectValueLabel: {
        wordBreak: "break-word"
    },
    contextActions: {
        paddingTop: theme.spacing.unit * 2
    },
    predefinedQueries: {
        flex: "1 1 auto",
        paddingTop: theme.spacing.unit * 2
    },
    footer: {
        justifySelf: "end",
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit
    },
    link: {
        cursor: 'pointer',
        color: theme.palette.text.primary,
        '&:hover': {
            color: lighten(theme.palette.text.primary, 0.2)
        },
        transition: theme.transitions.create('color', {
            duration: theme.transitions.duration.shortest
        })
    },

    ...Object.keys(config.objectColors)
        .map(name => ({
            [name]: {
                // @ts-ignore
                color: config.objectColors[name],
                '&:hover': {
                    // @ts-ignore
                    color: darken(config.objectColors[name], 0.2)
                }
            }
        }))
        .reduce((acc, x) => Object.assign({}, acc, x), {})
});

const ObjectInformationComp = ({
                                   classes,
                                   selectedObject,
                                   id,
                                   oneLeggedFacts,
                                   details,
                                   createFactDialog,
                                   onSearchSubmit,
                                   onCreateFactClick,
                                   onTitleClick,
                                   onFactClick,
                                   onPredefinedObjectQueryClick,
                               }: IObjectInformationComp) => {
    const labelFromFact = getObjectLabelFromFact(selectedObject, config.objectLabelFromFactType, oneLeggedFacts);
    const totalFacts = selectedObject.statistics ? selectedObject.statistics.reduce((acc: any, x: any) => x.count + acc, 0) : 0;
    const objectColor = objectTypeToColor(selectedObject.type.name);

    // @ts-ignore
    const selectedObjectClass = classes[selectedObject.type.name];

    return (
        <div className={classes.root}>

            <div onClick={() => onTitleClick()}>
                <Typography
                    variant='h6'
                    className={`${classes.link} ${selectedObjectClass}`}>
                    <div>{labelFromFact ? labelFromFact : objectValueText(selectedObject)}</div>
                </Typography>
            </div>
            {
                labelFromFact &&
                <Typography
                    variant='caption'>
                    <div className={classes.objectValueLabel}
                          style={{color: objectColor}}>
                        {objectValueText(selectedObject)}
                    </div>
                </Typography>
            }

            <Typography variant='subtitle1' gutterBottom>
                <span style={{color: objectColor}}>{selectedObject.type.name}</span>
            </Typography>

            <div className={classes.info}>
                <Typography variant='body1' gutterBottom>
                    {totalFacts} facts
                </Typography>

                <FactTypeTable selectedObject={selectedObject}
                               oneLeggedFacts={oneLeggedFacts}
                               onSearchSubmit={onSearchSubmit}
                               onFactClick={onFactClick}/>
            </div>

            <div className={classes.contextActions}>
                <ContextActions actions={details.contextActions}/>
            </div>

            <div className={classes.predefinedQueries}>
                <PredefinedObjectQueries
                    predefinedObjectQueries={details.predefinedObjectQueries}
                    onClick={onPredefinedObjectQueryClick}/>
            </div>
            <div className={classes.footer}>
                <Button onClick={(e) => onCreateFactClick(e)}>Create fact</Button>
                {createFactDialog && <CreateFactForObjectDialog store={createFactDialog} />}
            </div>
        </div>
    )
};

export interface IObjectInformationComp extends WithStyles<typeof styles>{
    id: string,
    selectedObject: ActObject,
    oneLeggedFacts: Array<ActFact>,
    details: ObjectDetails,
    createFactDialog: any,
    onSearchSubmit: (search: Search) => void,
    onFactClick: (f: ActFact) => void,
    onSearchClick: Function,
    onCreateFactClick: Function,
    onTitleClick: () => void,
    onPredefinedObjectQueryClick: (q: PredefinedObjectQuery) => void
}

const dataLoader = async ({id}: { id: string }) => {

    const selectedObject = await objectStatsDataLoader(id);

    const factTypes: Array<FactType> = await factTypesDataLoader();
    const oneLeggedFactTypeNames = factTypes
        .filter(ft => isOneLeggedFactType(ft))
        .map(ft => ft.name);

    const oneLeggedFacts = await factDataLoader(id, oneLeggedFactTypeNames);

    return {
        selectedObject: selectedObject,
        oneLeggedFacts: oneLeggedFacts
    }
};


const memoizedDataLoader = memoizeDataLoader(dataLoader, ['id']);

export default compose(
    withDataLoader(memoizedDataLoader, {
        alwaysShowLoadingComponent: true,
        LoadingComponent: CenteredCircularProgress
    }),
    withStyles(styles),
    observer
    // @ts-ignore
)(ObjectInformationComp)
