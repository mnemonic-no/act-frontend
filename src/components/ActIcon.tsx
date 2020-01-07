import React from 'react';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BugIcon from '@material-ui/icons/BugReport';
import CloseIcon from '@material-ui/icons/Close';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import LinkIcon from '@material-ui/icons/Link';

const ActIconComponent = ({ iconId }: { iconId: string }) => {
  switch (iconId) {
    case 'download':
      return <CloudDownloadIcon />;
    case 'link':
      return <LinkIcon />;
    case 'bug':
      return <BugIcon />;
    case 'close':
      return <CloseIcon />;
    case 'remove':
      return <CloseIcon />;
    case 'copy':
      return <AssignmentIcon />;
    default:
      throw Error('Icon with id "' + iconId + '" not supported in ActIconComponent');
  }
};

export default ActIconComponent;
