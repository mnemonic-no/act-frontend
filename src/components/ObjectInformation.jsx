import React from 'react'
import { compose, withHandlers } from 'recompose'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { darken, lighten } from '@material-ui/core/styles/colorManipulator'
import Button from '@material-ui/core/Button'

import withDataLoader from '../util/withDataLoader'
import memoizeDataLoader from '../util/memoizeDataLoader'
import actWretch from '../util/actWretch'
import CenteredCircularProgress from './CenteredCircularProgress'
import { objectTypeToColor, renderObjectValue } from '../util/utils'
import config from '../config'
import CreateFactDialog, { createFact } from './CreateFact/Dialog'
import PredefinedObjectQueries from './InformationPanel/PredefinedObjectQueries'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing.unit * 3}px)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1
  },
  info: {
    overflow: 'auto',
    flex: 1
  },
  actions: {
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
        color: config.objectColors[name],
        '&:hover': {
          color: darken(config.objectColors[name], 0.2)
        }
      }
    }))
    .reduce((acc, x) => Object.assign({}, acc, x), {})
})

const ObjectInformationComp = ({
  classes,
  data,
  onSearchSubmit,
  onSearchClick,
  onCreateFactClick
}) => {
  const totalFacts = data.statistics.reduce((acc, x) => x.count + acc, 0)
  const objectColor = objectTypeToColor(data.type.name)
  return (
    <div className={classes.root}>
      <div onClick={onSearchClick}>
        <Typography
          variant='h5'
          className={`${classes.link} ${classes[data.type.name]}`}
        >
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
        {data.statistics.map(x => (
          <Typography key={x.type.id}>
            {x.type.name}: {x.count}
          </Typography>
        ))}
      </div>

      <PredefinedObjectQueries {...{ data, onSearchSubmit }} />

      <div className={classes.actions}>
        <Button onClick={onCreateFactClick}>Create fact</Button>
        <CreateFactDialog />
      </div>
    </div>
  )
}

const dataLoader = ({ id }) =>
  actWretch
    .url(`/v1/object/uuid/${id}`)
    .get()
    .json(({ data }) => ({
      data
    }))

const memoizedDataLoader = memoizeDataLoader(dataLoader, ['id'])

export default compose(
  withDataLoader(memoizedDataLoader, {
    alwaysShowLoadingComponent: true,
    LoadingComponent: CenteredCircularProgress
  }),
  withStyles(styles),
  withHandlers({
    onSearchClick: ({ data, onSearchSubmit }) => () => {
      onSearchSubmit({
        objectType: data.type.name,
        objectValue: data.value
      })
    },
    onCreateFactClick: ({ data }) => () => {
      console.log('create fact', data)
      createFact(data)
    }
  })
)(ObjectInformationComp)
