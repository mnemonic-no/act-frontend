import types from './types';

export default ({ layoutName, layoutConfig }) => {
  const options = Object.keys(layoutConfig).map(optionName => {
    const { type, value } = layoutConfig[optionName];
    if (
      type === types.func ||
      type === types.funcNumber ||
      type === types.funcRange
    ) {
      // eslint-disable-next-line no-eval
      return { [optionName]: eval(value) };
    } else {
      return { [optionName]: value };
    }
  });
  return Object.assign({}, ...options, { name: layoutName });
};
