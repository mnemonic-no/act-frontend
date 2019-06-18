import React from 'react';
import { observer } from 'mobx-react';
import { compose } from 'recompose';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {WithStyles, withStyles} from '@material-ui/core/styles';

import { objectTypeToColor, renderObjectValue } from '../../util/utils';
import {ActObject} from "../../pages/types";
import {Theme} from "@material-ui/core";

const styles = (theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing.unit * 2
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing.unit * 4
  }
});

const ObjectRowComp = ({ onRowClick, object, classes } : IOBjectRowComp)  => (
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

interface IOBjectRowComp extends WithStyles<typeof styles> {
    object: ActObject,
    onRowClick: (o: ActObject) => void
}

export const ObjectRow = compose<IOBjectRowComp, Pick<IOBjectRowComp, Exclude<keyof IOBjectRowComp, "classes">>>(
  withStyles(styles),
  observer
)(ObjectRowComp);
