import React from 'react';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import LinkIcon from '@material-ui/icons/Link';

const ActIconComponent = ({ iconId }: { iconId: string }) => {
  switch (iconId) {
    case 'download':
      return <CloudDownloadIcon />;
    case 'link':
      return <LinkIcon />;
    default:
      throw Error('Icon with id ' + iconId + ' not supported in ActIconComponent');
  }
};

export default ActIconComponent;
