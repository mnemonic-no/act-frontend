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

const ObjectTitleComp = ({ title, metaTitle, subTitle, color, onTitleClick }: IObjectTitleComp) => {
  const classes = useStyles();

  return (
    <div style={{ color: color }}>
      <div onClick={onTitleClick}>
        <Typography variant="h6" className={cc(classes.longLabel, { [classes.link]: Boolean(onTitleClick) })}>
          <div>{title}</div>
        </Typography>
      </div>

      {metaTitle && (
        <Typography variant="caption">
          <div className={classes.longLabel}>{metaTitle}</div>
        </Typography>
      )}
      <Typography variant="subtitle1" gutterBottom>
        <span>{subTitle}</span>
      </Typography>
    </div>
  );
};

export interface IObjectTitleComp {
  title: string;
  metaTitle?: string;
  subTitle: string;
  color: string;
  onTitleClick?: () => void;
}

export default ObjectTitleComp;
