import React from 'react';
import { compose, withProps } from 'recompose';
import { observer } from 'mobx-react';

import CytoscapeContainer from '../Cytoscape/Cytoscape';
import cytoscapeState from '../state/cytoscape';
import graphInformation from '../state/graphInformation';

const GraphViewComp = ({
  cytoscapeState,
  graphInformation,
  onNodeClick,
  onNodeCtxClick
}) => {
  const { elements, layout, style } = cytoscapeState;
  // return 'blank';
  return (
    <CytoscapeContainer
      selectedNode={graphInformation.selectedNode.id}
      {...{ elements, layout, onNodeClick, onNodeCtxClick, style }}
    />
  );
};

export default compose(
  withProps({ cytoscapeState, graphInformation }),
  observer
)(GraphViewComp);
