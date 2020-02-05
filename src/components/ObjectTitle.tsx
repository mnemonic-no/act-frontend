import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import cc from 'clsx';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    cursor: 'pointer',
    '&:hover': {
      filter: 'brightness(0.7)'
    }
  },
  longLabel: {
    wordBreak: 'break-word'
  }
}));

const ObjectTitleComp = (props: IObjectTitleProps) => {
  const classes = useStyles();

  return (
    <div style={{ color: props.color }}>
      <div onClick={props.onTitleClick}>
        <Typography variant="h6" className={cc(classes.longLabel, { [classes.link]: Boolean(props.onTitleClick) })}>
          <div>{props.title}</div>
        </Typography>
      </div>

      {props.metaTitle && (
        <Typography variant="caption">
          <div className={classes.longLabel}>{props.metaTitle}</div>
        </Typography>
      )}
      <Typography variant="subtitle1" gutterBottom>
        <span>{props.subTitle}</span>
      </Typography>
    </div>
  );
};

export interface IObjectTitleProps {
  title: string;
  metaTitle?: string;
  subTitle: string;
  color: string;
  onTitleClick?: () => void;
}

export default ObjectTitleComp;
