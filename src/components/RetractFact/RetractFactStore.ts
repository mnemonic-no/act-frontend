import { ActFact } from '../../core/types';
import { action, observable } from 'mobx';
import { ActApi } from '../../backend/ActApi';
import { addMessage } from '../../util/SnackbarProvider';
import EventBus from '../../util/eventbus';

class RetractFactStore {
  actApi: ActApi;
  eventBus: EventBus;
  @observable open = false;
  @observable fact: ActFact | null = null;
  @observable isSubmitting = false;
  @observable error: any;

  constructor(eventBus: EventBus, actApi: ActApi) {
    this.eventBus = eventBus;
    this.actApi = actApi;
  }

  @action.bound
  async retractFact(fields: any) {
    this.isSubmitting = true;

    if (this.fact === null) {
      return;
    }

    try {
      await this.actApi.retractFact(this.fact, fields.comment, fields.accessMode);
      this.onSuccess(this.fact);
    } catch (error) {
      this.error = error;
    } finally {
      this.isSubmitting = false;
    }
  }

  @action.bound
  onSuccess(fact: ActFact) {
    this.error = null;
    addMessage('Fact retracted');
    this.open = false;

    setTimeout(() => {
      this.eventBus.publish([{ kind: 'fetchFact', factId: fact.id, refetch: true }]);
    }, 1000);
  }

  @action.bound
  openRetractDialog(fact: ActFact) {
    this.open = true;
    this.fact = fact;
  }

  @action.bound
  close() {
    this.open = false;
  }
}

export default RetractFactStore;
