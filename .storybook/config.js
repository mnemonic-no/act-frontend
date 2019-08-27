import { configure, addParameters } from '@storybook/react';

function loadStories() {
  require('../stories/index');
}

addParameters({
  options: { isFullscreen: false, showPanel: false }
});

configure(loadStories, module);
