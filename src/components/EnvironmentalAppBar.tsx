import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';

import type { TBanner } from '../core/types';
import AboutButton from './About';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appBar: {
      backgroundColor: (props: any) => props.appBarBackgroundColor
    },
    banner: {
      position: 'absolute',
      userSelect: 'none',
      bottom: 0,
      marginLeft: theme.spacing(3)
    },
    appBarLeft: {
      display: 'flex',
      flexGrow: 1,
      position: 'relative'
    },
    appBarLogo: {
      height: 44,
      maxWidth: 'none'
    }
  };
});

export interface IEnvironmentalAppBar {
  banner?: TBanner;
}

const Banner = (props: TBanner) => {
  const classes = useStyles({});
  return (
    <div className={classes.banner} style={{ color: props.textColor }}>
      <Typography variant="caption" display={'block'} noWrap>
        {props.text}
      </Typography>
    </div>
  );
};

const EnvironmentalAppBar = (props: IEnvironmentalAppBar) => {
  const classes = useStyles({ appBarBackgroundColor: props.banner?.backgroundColor });

  return (
    <AppBar position="static" className={classes.appBar}>
      {props.banner && <Banner {...props.banner} />}
      <Toolbar>
        <div className={classes.appBarLeft}>
          <a href="/">
            <img src="/act-logo-onDark.svg" alt="ACT" className={classes.appBarLogo} />
          </a>
        </div>

        <Button color="inherit" component="a" href="/examples">
          Examples
        </Button>
        <AboutButton />
      </Toolbar>
    </AppBar>
  );
};

export default EnvironmentalAppBar;
