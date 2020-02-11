import { ActSelection, WorkingHistoryItem } from './types';

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

export interface FetchFact {
  kind: 'fetchFact';
  factId: string;
  refetch?: boolean;
}

export interface WorkingHistoryRemoveItem {
  kind: 'workingHistoryRemoveItem';
  item: WorkingHistoryItem;
}

export interface ErrorEvent {
  kind: 'errorEvent';
  error: Error;
  title?: string;
}

export type ActEvent =
  | NavigateEvent
  | ErrorEvent
  | SelectionReset
  | SelectionRemove
  | SelectionClear
  | SelectionToggle
  | FetchActObjectStats
  | FetchFact
  | FetchOneLeggedFacts
  | WorkingHistoryRemoveItem;
