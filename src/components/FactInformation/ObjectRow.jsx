import React from 'react';
import { observer } from 'mobx-react/index';
import { compose} from 'recompose';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import { withStyles } from '@material-ui/core/styles/index';

import { objectTypeToColor, renderObjectValue } from '../../util/utils';

const styles = theme => ({
  cell: {
    paddingLeft: theme.spacing.unit * 2
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing.unit * 4
  }
});

const ObjectRowComp = ({ onRowClick, classes, object }) => (
  <TableRow
    key={object.id}
    hover
    classes={{ root: classes.row }}
    onClick={() => onRowClick(object)}>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      <span style={{ color: objectTypeToColor(object.type.name) }}>
        {object.type.name}
      </span>
    </TableCell>
    <TableCell classes={{ root: classes.cell }} padding='dense'>
      {renderObjectValue(object, 256)}
    </TableCell>
  </TableRow>
);

export const ObjectRow = compose(
  withStyles(styles),
  observer
)(ObjectRowComp);
