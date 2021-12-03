import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { link } from '../../../util/util';

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
    marginBottom: theme.spacing(3)
  },
  text: {
    marginTop: theme.spacing(4)
  }
}));

const GraphEmptyComp = (props: { navigateFn: (url: string) => void }) => {
  const classes = useStyles();

  const links = [
    '/object-fact-query/ipv4/153.148.23.118',
    '/object-fact-query/threatActor/sofacy',
    '/object-fact-query/technique/Credential%20Dumping',
    '/object-fact-query/tool/foosace',
    '/object-fact-query/hash/da2a657dc69d7320f2ffc87013f257ad'
  ].map(url =>
    link({
      text: url,
      href: url,
      tooltip: 'Execute query',
      navigateFn: props.navigateFn
    })
  );

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        <img className={classes.logo} src="/act-logo-onWhite.svg" alt="ACT | The Open Threat Intelligence Platform" />
        <Typography className={classes.text}>
          Use the left menu to search for objects.
          <br />
          To get started try out one of these examples
        </Typography>
        <Typography component="ul" className={classes.list}>
          {links.map(link => (
            <li key={link.text}>
              <Tooltip title={link.tooltip}>
                <Link href={link.href} color="primary" underline={'always'} onClick={link.onClick}>
                  {link.text}
                </Link>
              </Tooltip>
            </li>
          ))}
        </Typography>
        <Button variant="outlined" component="a" href="/examples">
          Click here for a full list of examples
        </Button>
      </div>
    </div>
  );
};

export default GraphEmptyComp;
