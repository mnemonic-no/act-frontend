import React from 'react';
import { withState, compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  }
});

const AboutContentsComp = ({ classes }) => (
  <div className={classes.root}>
    <Typography variant='headline' gutterBottom>
      About
    </Typography>
    <Typography variant='body1' paragraph>
      Threat intelligence plays an important role in defending against modern
      threat actors. However existing platforms focus on collecting data rather
      than analysing it, lack flexibility to support collaboration, and are
      often closed solutions that make sharing intelligence a challenge.
    </Typography>
    <Typography variant='body1' paragraph>
      Semi-automated Cyber Threat Intelligence (ACT) is a joint research effort
      that has delivered an open platform to enable the collection, analysis and
      sharing of threat intelligence.
    </Typography>
    <Typography variant='body1' gutterBottom>
      <Button
        component='a'
        style={{ marginLeft: -16 }}
        color='secondary'
        href='https://www.mnemonic.no/research-and-development/semi-automated-cyber-threat-intelligence/'
      >
        Learn more at mnemonic.no
      </Button>
    </Typography>
    {/* <Typography variant='title' gutterBottom>
      Licenses
    </Typography>

    <Typography variant='body1' gutterBottom>
      <ul>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
        <li>Vestibulum auctor dapibus neque.</li>
        <li>Nunc dignissim risus id metus.</li>
        <li>Cras ornare tristique elit.</li>
        <li>Vivamus vestibulum nulla nec ante.</li>
        <li>Praesent placerat risus quis eros.</li>
        <li>Fusce pellentesque suscipit nibh.</li>
        <li>Integer vitae libero ac risus egestas placerat.</li>
        <li>Vestibulum commodo felis quis tortor.</li>
        <li>Ut aliquam sollicitudin leo.</li>
        <li>Cras iaculis ultricies nulla.</li>
        <li>Donec quis dui at dolor tempor interdum.</li>
        <li>Vivamus molestie gravida turpis</li>
      </ul>
    </Typography> */}
  </div>
);
const AboutContents = withStyles(style)(AboutContentsComp);

export const AboutButtonComp = ({ className, open, setOpen }) => (
  <div className={className}>
    <Button color='inherit' onClick={() => setOpen(true)}>
      About
    </Button>
    <Dialog open={open} onClose={() => setOpen(false)}>
      <AboutContents />
    </Dialog>
  </div>
);

export const AboutButton = compose(withState('open', 'setOpen', false))(
  AboutButtonComp
);
