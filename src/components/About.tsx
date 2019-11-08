import React, { useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2)
  }
}));

const AboutButton = () => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  return (
    <div>
      <Button color="inherit" onClick={() => setOpen(true)}>
        About
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className={classes.root}>
          <Typography variant="h5" gutterBottom>
            About
          </Typography>
          <Typography variant="body2" paragraph>
            Threat intelligence plays an important role in defending against modern threat actors. However existing
            platforms focus on collecting data rather than analysing it, lack flexibility to support collaboration, and
            are often closed solutions that make sharing intelligence a challenge.
          </Typography>
          <Typography variant="body2" paragraph>
            Semi-automated Cyber Threat Intelligence (ACT) is a joint research effort that has delivered an open
            platform to enable the collection, analysis and sharing of threat intelligence.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <Button
              component="a"
              style={{ marginLeft: -16 }}
              color="secondary"
              href="https://www.mnemonic.no/research-and-development/semi-automated-cyber-threat-intelligence/">
              Learn more at mnemonic.no
            </Button>
          </Typography>
        </div>
      </Dialog>
    </div>
  );
};

export default AboutButton;
