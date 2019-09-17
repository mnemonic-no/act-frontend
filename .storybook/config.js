import { configure, addParameters } from '@storybook/react';

const req = require.context('../src/stories', true, /\.story\.tsx$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addParameters({
  options: { isFullscreen: false, showPanel: false }
});

configure(loadStories, module);
