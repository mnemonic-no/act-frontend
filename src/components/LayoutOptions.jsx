import React from 'react';
import { compose, withState, withHandlers, withProps } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Input from '@material-ui/core/Input';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import graphOptions from '../state/graphOptions';
import ListItemControl from './ListItemControl';
import LAYOUTS, { layoutConfigToObject, types } from '../Cytoscape/layouts';
import withLocalstorageState from '../util/withLocalstorageState';

const LayoutOptionControl = ({ onChange, value, type, min, max }) => {
  switch (type) {
    case types.boolean:
      return <Switch checked={value} onClick={() => onChange(!value)} />;

    // TODO
    case types.range:
      return <input type='range' value={value} />;

    // Switch between end and false
    case types.animate:
      return (
        <Switch
          checked={value === 'end'}
          onClick={() => onChange(value === 'end' ? false : 'end')}
        />
      );
    case types.number:
      return (
        <ListItemControl>
          <Input
            type='number'
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </ListItemControl>
      );
    case types.funcNumber:
      return (
        <ListItemControl>
          <Input
            type='number'
            // eslint-disable-next-line no-eval
            value={eval(value)()}
            onChange={e => onChange(`() => ${e.target.value}`)}
          />
        </ListItemControl>
      );
    case types.funcRange:
      return (
        <Input
          type='range'
          // eslint-disable-next-line no-eval
          value={eval(value)()}
          onChange={e => onChange(`() => ${e.target.value}`)}
        />
      );
    case types.func:
      return (
        <ListItemControl>
          <Input value={value} onChange={e => onChange(e.target.value)} />
        </ListItemControl>
      );
    default:
      throw new Error(`unknown type ${value.type}, for value ${value}`);
  }
};

const LayoutOptionsList = ({
  layoutConfig,
  layoutName,
  layoutUrl,
  onChange
}) => {
  return (
    <List dense>
      {Object.keys(layoutConfig).map(optionName => {
        if (layoutConfig[optionName].type === types.invisible) return null;
        return (
          <ListItem disableGutters key={`${layoutName}-${optionName}`}>
            {layoutConfig[optionName].description ? (
              <Tooltip title={layoutConfig[optionName].description}>
                <ListItemText primary={optionName} />
              </Tooltip>
            ) : (
              <ListItemText primary={optionName} />
            )}
            <ListItemSecondaryAction>
              <LayoutOptionControl
                value={layoutConfig[optionName].value}
                type={layoutConfig[optionName].type}
                min={layoutConfig[optionName].min}
                max={layoutConfig[optionName].value}
                onChange={value =>
                  onChange(
                    Object.assign({}, layoutConfig, {
                      [optionName]: Object.assign(
                        {},
                        layoutConfig[optionName],
                        {
                          value
                        }
                      )
                    })
                  )
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

const styles = theme => ({
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
});

const LayoutOptionsComp = ({
  classes,
  graphOptions,
  layoutError,
  onLayoutConfigChange,
  showLayoutOptions,
  setShowLayoutOptions
}) => (
  <Grid container spacing={16}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label='Layout'
        select
        value={graphOptions.layout.layoutName}
        onChange={e => {
          // Dirty hack to get it to work...
          graphOptions.setLayout(
            LAYOUTS[
              Object.keys(LAYOUTS).find(
                x => LAYOUTS[x].layoutName === e.target.value
              )
            ]
          );
        }}
      >
        {Object.keys(LAYOUTS).map(layout => (
          <MenuItem
            dense
            key={LAYOUTS[layout].layoutName}
            value={LAYOUTS[layout].layoutName}
          >
            {LAYOUTS[layout].layoutName}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
    <Grid item xs={12}>
      <List dense>
        <ListItem disableGutters>
          <ListItemText secondary={'Layout options'} />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => setShowLayoutOptions(!showLayoutOptions)}
              className={classnames(classes.expand, {
                [classes.expandOpen]: showLayoutOptions
              })}
            >
              <ExpandMoreIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <Collapse in={showLayoutOptions} transitionDuration='auto' unmountOnExit>
        <Divider />
        <LayoutOptionsList
          layoutConfig={graphOptions.layout.layoutConfig}
          layoutName={graphOptions.layout.layoutName}
          onChange={onLayoutConfigChange}
        />
        <a href={graphOptions.layout.layoutUrl}>
          <Typography>Reference</Typography>
        </a>
      </Collapse>
    </Grid>
  </Grid>
);

export default compose(
  withProps({ graphOptions }),
  observer,
  withState('layoutError', 'setlayoutError', null),
  withHandlers({
    onLayoutConfigChange: ({
      layout,
      graphOptions,
      setlayoutError
    }) => layoutConfig => {
      try {
        const newLayout = {
          layoutName: graphOptions.layout.layoutName,
          layoutUrl: graphOptions.layout.layoutUrl,
          layoutConfig,
          layoutObject: layoutConfigToObject({
            layoutName: graphOptions.layout.layoutName,
            layoutConfig
          })
        };
        graphOptions.setLayout(newLayout);
        setlayoutError(null);
      } catch (e) {
        setlayoutError(`${e.name}: ${e.message}`);
      }
    }
  }),
  withLocalstorageState(
    'options.showLayoutOptions',
    'showLayoutOptions',
    'setShowLayoutOptions',
    false
  ),
  withStyles(styles),
  observer
)(LayoutOptionsComp);
