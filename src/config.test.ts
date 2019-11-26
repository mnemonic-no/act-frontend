import { parseObjectSummary, resolveActions } from './config';

it('can resolve context actions', () => {
  expect(resolveActions({ contextActions: [], actions: {} })).toEqual([]);

  expect(() => {
    resolveActions({
      contextActions: [
        {
          objects: ['report'],
          action: 'doSomething'
        }
      ],
      actions: {}
    });
  }).toThrowError('Failed to resolve contextActions');

  expect(
    resolveActions({
      contextActions: [
        {
          objects: ['report'],
          action: 'download-report'
        }
      ],
      actions: {
        'download-report': {
          name: 'Download',
          type: 'link',
          description: 'Download report',
          urlPattern: 'https://xyz.abc'
        }
      }
    })
  ).toEqual([
    {
      objects: ['report'],
      action: {
        name: 'Download',
        type: 'link',
        description: 'Download report',
        urlPattern: 'https://xyz.abc'
      }
    }
  ]);
});

it('can parse object summary config', () => {
  expect(parseObjectSummary({ objectSummary: {}, actions: {} })).toEqual({});

  expect(
    parseObjectSummary({ objectSummary: { tool: { sections: [{ title: 'a', query: 'q' }] } }, actions: {} })
  ).toEqual({ tool: { sections: [{ title: 'a', query: 'q' }] } });

  const downloadAction = {
    type: 'link' as 'link',
    name: 'Download',
    description: 'Downloading',
    urlPattern: 'https://x.y.z/download'
  };

  expect(
    parseObjectSummary({
      objectSummary: {
        tool: { sections: [{ title: 'a', query: 'q', actions: [{ id: 'download', icon: 'someIcon' }] }] }
      },
      actions: {
        download: downloadAction
      }
    })
  ).toEqual({
    tool: { sections: [{ title: 'a', query: 'q', actions: [{ action: downloadAction, icon: 'someIcon' }] }] }
  });
});
