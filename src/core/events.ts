import { ActSelection } from './types';

export interface NavigateEvent {
  kind: 'navigate';
  url: string;
}

export interface SelectionReset {
  kind: 'selectionReset';
  selection: { [id: string]: ActSelection };
}

export interface SelectionRemove {
  kind: 'selectionRemove';
  removeAll: Array<ActSelection>;
}

export interface SelectionClear {
  kind: 'selectionClear';
}

export interface SelectionToggle {
  kind: 'selectionToggle';
  item: ActSelection;
}

export interface FetchActObjectStats {
  kind: 'fetchActObjectStats';
  objectValue: string;
  objectTypeName: string;
}

export interface FetchOneLeggedFacts {
  kind: 'fetchOneLeggedFacts';
  objectId: string;
}

export type ActEvent =
  | NavigateEvent
  | SelectionReset
  | SelectionRemove
  | SelectionClear
  | SelectionToggle
  | FetchActObjectStats
  | FetchOneLeggedFacts;
