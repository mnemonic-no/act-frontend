import rawConfig from './config.json';
import * as _ from 'lodash/fp';

type Config = {
  [key: string]: any;
};

let config: Config = rawConfig;

// Set by react scripts
if (process.env.NODE_ENV === 'development') {
  config = { ...rawConfig, ...require('./config.override.json') };
}

export type TLinkActionTemplate = {
  type: 'link';
  name: string;
  description: string;
  urlPattern?: string;
  pathPattern?: string;
};

export type TPostAndForgetActionTemplate = {
  type: 'postAndForget';
  name: string;
  description: string;
  urlPattern?: string;
  pathPattern?: string;
  confirmation?: string;
  jsonBody?: { [key: string]: any };
};

export type ActionTemplate = TLinkActionTemplate | TPostAndForgetActionTemplate;

export type ContextActionTemplate = {
  objects?: Array<string>;
  action: ActionTemplate;
};

export type TSectionAction = {
  icon: 'download' | 'link';
  action: ActionTemplate;
};

export type TSectionConfig = {
  title: string;
  query: string;
  actions?: Array<TSectionAction>;
};

export const parseObjectSummary = ({
  objectSummary,
  actions
}: {
  objectSummary: {
    [objectTypeName: string]: {
      sections: Array<{ title: string; query: string; actions?: Array<{ id: string; icon: string }> }>;
    };
  };
  actions: { [actionId: string]: ActionTemplate };
}): { [id: string]: { sections: Array<TSectionConfig> } } => {
  return _.pipe(
    _.mapValues((conf: { sections: any }) => {
      return {
        sections: conf.sections.map((section: { actions?: Array<{ id: string; icon: string }> }) => {
          if (!section.actions) return section;

          return {
            ...section,
            actions: section.actions.map((x: { id: string; icon: string }) => {
              if (!actions[x.id]) {
                throw Error(
                  'Failed to parse objectSummary in config, could not find action in section ' +
                    JSON.stringify(section) +
                    '. Actions must have an id which refers to an existing action in config.actions.'
                );
              }
              return { action: actions[x.id], icon: x.icon };
            })
          };
        })
      };
    })
  )(objectSummary);
};

export const resolveActions = ({
  contextActions,
  actions
}: {
  contextActions: Array<any>;
  actions: { [actionId: string]: ActionTemplate };
}): Array<ContextActionTemplate> => {
  if (!contextActions) return [];

  return contextActions.map(ca => {
    if (!actions[ca.action]) {
      throw Error(
        'Failed to resolve contextActions in config, could not find ' + ca.action + '. Is it defined in actions?'
      );
    }

    return { ...ca, action: actions[ca.action] };
  });
};

export default config;
