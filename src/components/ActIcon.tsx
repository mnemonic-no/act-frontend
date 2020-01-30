import React from 'react';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BugIcon from '@material-ui/icons/BugReport';
import CloseIcon from '@material-ui/icons/Close';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ErrorIcon from '@material-ui/icons/Error';
import LinkIcon from '@material-ui/icons/Link';

const ActIconComponent = ({ iconId }: { iconId: string }) => {
  switch (iconId) {
    case 'bug':
      return <BugIcon />;
    case 'close':
      return <CloseIcon />;
    case 'copy':
      return <AssignmentIcon />;
    case 'download':
      return <CloudDownloadIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'link':
      return <LinkIcon />;
    case 'remove':
      return <CloseIcon />;
    default:
      throw Error('Icon with id "' + iconId + '" not supported in ActIconComponent');
  }
};

export default ActIconComponent;
