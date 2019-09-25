import { configure, addParameters } from '@storybook/react';

addParameters({
  options: { isFullscreen: false, showPanel: false }
});

configure(require.context('../src/stories', true, /\.story\.tsx$/), module);
