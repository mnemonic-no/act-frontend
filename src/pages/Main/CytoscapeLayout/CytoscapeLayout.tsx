import React from 'react';
import { observer } from 'mobx-react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { TCytoscapeLayout } from './CytoscapeLayoutStore';
import LAYOUTS, { types } from '../../../Cytoscape/layouts';
import ListItemControl from '../../../components/ListItemControl';

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

const CytoscapeLayout = (props: ICytoscapeLayout) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Layout"
          select
          value={props.layout.layoutName}
          onChange={e => {
            props.setLayout(
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
                onClick={() => props.toggleShowLayoutOptions()}
                className={cc(classes.expand, {
                  [classes.expandOpen]: props.showLayoutOptions
                })}>
                <ExpandMoreIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Collapse in={props.showLayoutOptions} unmountOnExit>
          <Divider />
          <LayoutOptionsList
            layoutConfig={props.layout.layoutConfig}
            layoutName={props.layout.layoutName}
            onChange={(layout: any) => props.onLayoutConfigChange(layout)}
          />
          <a href={props.layout.layoutUrl}>
            <Typography>Reference</Typography>
          </a>
        </Collapse>
      </Grid>
    </Grid>
  );
};

export interface ICytoscapeLayout {
  layout: TCytoscapeLayout;
  setLayout: (l: TCytoscapeLayout) => void;
  showLayoutOptions: boolean;
  toggleShowLayoutOptions: () => void;
  onLayoutConfigChange: (layoutConfig: any) => void;
}

export default observer(CytoscapeLayout);
