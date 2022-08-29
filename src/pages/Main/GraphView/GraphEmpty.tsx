import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { TActionButton, TLink } from '../../../core/types';
import ActionButton from '../../../components/ActionButton';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column'
  },
  inner: {
    marginTop: 80,
    [theme.breakpoints.down('md')]: {
      marginTop: 80
    }
  },
  logo: {
    width: 512
  },
  list: {
    marginTop: theme.spacing(),
  },
  text: {
    marginTop: theme.spacing(4)
  },
  moreButton: {
    marginTop: theme.spacing(3)
  }
}));

const GraphEmptyComp = (props: { title?: string, links: Array<TLink>, moreButton?: TActionButton }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        <img className={classes.logo} src="/act-logo-onWhite.svg" alt="ACT | The Open Threat Intelligence Platform"/>
        <Typography className={classes.text}>
          Use the left menu to search for objects.
        </Typography>
        {props.links?.length > 0 &&
          <>
            <Typography>To get started try out one of these examples</Typography>
            <Typography component="ul" className={classes.list}>
              {props.links.map(link => (
                <li key={link.text}>
                  <Tooltip title={link.tooltip} enterDelay={1000}>
                    <Link href={link.href} color="primary" underline={'always'} onClick={link.onClick}>
                      {link.text}
                    </Link>
                  </Tooltip>
                </li>
              ))}
            </Typography>
          </>
        }
        {props.moreButton && <div className={classes.moreButton}><ActionButton {...props.moreButton} /></div>}
      </div>
    </div>
  );
};

export default GraphEmptyComp;
