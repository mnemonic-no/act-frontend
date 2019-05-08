import React from 'react'
import { compose, withHandlers } from 'recompose'
import Typography from '@material-ui/core/Typography/index'
import {withStyles, createStyles, Theme} from "@material-ui/core"
import { darken, lighten } from '@material-ui/core/styles/colorManipulator'
import Button from '@material-ui/core/Button/index'

import config from '../../config'
import withDataLoader from '../../util/withDataLoader'
import memoizeDataLoader from '../../util/memoizeDataLoader'
import actWretch from '../../util/actWretch'
import CenteredCircularProgress from '../CenteredCircularProgress'
import CreateFactDialog, { createFact } from '../CreateFact/Dialog'
import { objectTypeToColor, renderObjectValue } from '../../util/utils'
import {ObjectDetails} from "../../pages/Details/DetailsStore";
import PredefinedObjectQueries from "./PredefinedObjectQueries";
import ContextActions from "./ContextActions";

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
    minHeight: "100px"
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
  factTypeButton: {
    textTransform: "none"
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
  data,
  objectDetails,
  onSearchSubmit,
  onSearchClick,
  onCreateFactClick
}: {
  classes: any,
  data: any,
  objectDetails: ObjectDetails,
  onSearchSubmit: Function,
  onSearchClick: Function,
  onCreateFactClick: Function
}) => {
  const totalFacts = data.statistics.reduce((acc : any, x : any) => x.count + acc, 0);
  const objectColor = objectTypeToColor(data.type.name);
  return (
    <div className={classes.root}>
      <div onClick={(e) => onSearchClick(e)}>
        <Typography
            variant='h5'
            className={`${classes.link} ${classes[data.type.name]}`}>
          <span>{renderObjectValue(data, 256)}</span>
        </Typography>
      </div>
      <Typography variant='subtitle1' gutterBottom>
        <span style={{ color: objectColor }}>{data.type.name}</span>
      </Typography>

      <div className={classes.info}>
        <Typography variant='body1' gutterBottom>
          {totalFacts} facts
        </Typography>
        {data.statistics
            .sort((a: any, b: any) => a.type.name > b.type.name ? 1 : -1)
            .map((x: any) => (
                <div key={x.type.id}>
                  <Button size="small" className={classes.factTypeButton} onClick={() =>
                      onSearchSubmit({
                        objectType: data.type.name,
                        objectValue: data.value,
                        factTypes: [x.type.name]
                      })}
                  >{x.type.name}: {x.count}</Button>
                </div>
            ))}
      </div>

        <div className={classes.contextActions}>
            <ContextActions actions={objectDetails.contextActions}/>
        </div>

        <div className={classes.predefinedQueries}>
          <PredefinedObjectQueries
              predefinedObjectQueries={objectDetails.predefinedObjectQueries}
              onClick={objectDetails.predefinedObjectQueryOnClick}/>
      </div>
      <div className={classes.footer}>
        <Button onClick={(e) => onCreateFactClick(e)}>Create fact</Button>
        <CreateFactDialog />
      </div>
    </div>
  )
};

const dataLoader = ({ id } : any) =>
  actWretch
    .url(`/v1/object/uuid/${id}`)
    .get()
    .json(({ data } : any) => ({
      data
    }));

const memoizedDataLoader = memoizeDataLoader(dataLoader, ['id']);

export default compose(
  withDataLoader(memoizedDataLoader, {
    alwaysShowLoadingComponent: true,
    LoadingComponent: CenteredCircularProgress
  }),
  withStyles(styles),
  withHandlers({
    onSearchClick: ({ data, onSearchSubmit } : {data: any, onSearchSubmit: Function}) => () => {
      onSearchSubmit({
        objectType: data.type.name,
        objectValue: data.value
      })
    },
    onCreateFactClick: ({ data } : any) => () => {
      console.log('create fact', data);
      createFact(data)
    }
  })
    // @ts-ignore
)(ObjectInformationComp)
