import React from 'react';
import BugIcon from '@material-ui/icons/BugReport';
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
    default:
      throw Error('Icon with id ' + iconId + ' not supported in ActIconComponent');
  }
};

export default ActIconComponent;
