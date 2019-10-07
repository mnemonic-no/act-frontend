import React from 'react';
import { observer } from 'mobx-react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  Collapse,
  Divider,
  Grid,
  Input,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  makeStyles,
  Switch,
  TextField,
  Tooltip,
  Theme,
  Typography
} from '@material-ui/core';

// TODO check if package supports types
// @ts-ignore
import classnames from 'classnames';

import LAYOUTS, { types } from '../../Cytoscape/layouts';
import ListItemControl from '../../components/ListItemControl';
import CytoscapeLayoutStore from './CytoscapeLayoutStore';

const useStyles = makeStyles((theme: Theme) => ({
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}));

const LayoutOptionControl = ({ onChange, value, type, min, max }: any) => {
  switch (type) {
    case types.boolean:
      return <Switch checked={value} onClick={() => onChange(!value)} />;

    // TODO
    case types.range:
      return <input type="range" value={value} />;

    // Switch between end and false
    case types.animate:
      return <Switch checked={value === 'end'} onClick={() => onChange(value === 'end' ? false : 'end')} />;
    case types.number:
      return (
        <ListItemControl>
          <Input type="number" value={value} onChange={e => onChange(e.target.value)} />
        </ListItemControl>
      );
    case types.funcNumber:
      return (
        <ListItemControl>
          <Input
            type="number"
            // eslint-disable-next-line no-eval
            value={eval(value)()}
            onChange={e => onChange(`() => ${e.target.value}`)}
          />
        </ListItemControl>
      );
    case types.funcRange:
      return (
        <Input
          type="range"
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

const LayoutOptionsList = ({ layoutConfig, layoutName, onChange }: any) => {
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
                onChange={(value: any) =>
                  onChange(
                    Object.assign({}, layoutConfig, {
                      [optionName]: Object.assign({}, layoutConfig[optionName], {
                        value
                      })
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

const CytoscapeLayout = ({ store }: ICytoscapeLayout) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Layout"
          select
          value={store.layout.layoutName}
          onChange={e => {
            // Dirty hack to get it to work...
            store.setLayout(
              // @ts-ignore
              LAYOUTS[Object.keys(LAYOUTS).find(x => LAYOUTS[x].layoutName === e.target.value)]
            );
          }}>
          {Object.keys(LAYOUTS).map(layout => (
            <MenuItem
              dense
              // @ts-ignore
              key={LAYOUTS[layout].layoutName}
              // @ts-ignore
              value={LAYOUTS[layout].layoutName}>
              {
                // @ts-ignore
                LAYOUTS[layout].layoutName
              }
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
                onClick={() => store.toggleShowLayoutOptions()}
                className={classnames(classes.expand, {
                  [classes.expandOpen]: store.showLayoutOptions
                })}>
                <ExpandMoreIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Collapse in={store.showLayoutOptions} unmountOnExit>
          <Divider />
          <LayoutOptionsList
            layoutConfig={store.layout.layoutConfig}
            layoutName={store.layout.layoutName}
            onChange={(layout: any) => store.onLayoutConfigChange(layout)}
          />
          <a href={store.layout.layoutUrl}>
            <Typography>Reference</Typography>
          </a>
        </Collapse>
      </Grid>
    </Grid>
  );
};

interface ICytoscapeLayout {
  store: CytoscapeLayoutStore;
}

export default observer(CytoscapeLayout);
