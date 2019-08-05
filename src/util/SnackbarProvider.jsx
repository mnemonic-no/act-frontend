import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const DEFAULT_OPTIONS = {
  autoHideDuration: 4000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  action: null,

  // Non-standard options
  closeOnClickaway: false,
  removePrevious: false
};

export class EventEmitter {
  registerAddMessage = addMessagefunc => {
    this.addMessageFunc = addMessagefunc;
  };
  addMessage = (message, options) => this.addMessageFunc(message, options);
}

export const createSnackbarProvider = eventEmitter =>
  class SnackbarProvider extends React.Component {
    constructor() {
      super();
      eventEmitter.registerAddMessage(this.addMessage);

      this.messageCount = 0;

      this.state = {
        open: false,
        inTransition: false,
        messages: []
      };
    }

    onEntered = () => {
      this.setState(state => ({
        // Close for the next one
        open: !(state.messages.length > 1),
        inTransition: state.messages.length > 1
      }));
    };

    onExited = () => {
      this.setState(state => ({
        // Remove the message that has been closed
        messages: state.messages.slice(1),

        // Open the next one
        open: state.messages.length > 1,
        inTransition: state.messages.length > 1
      }));
    };

    addMessage = (message, options = {}) => {
      // Close callback
      this.messageCount += 1;
      const key = this.messageCount;
      const closeFunc = () =>
        this.setState(state => {
          // Ensure that the onClose function only can close it's assigned message, nobody else's.
          // Would lead to quirky corner cases where a delayed onClose dismisses newer message
          if (state.messages.length > 0 && state.messages[0].key === key) {
            return { open: false };
          }
          return {};
        });

      this.setState(state => {
        // Remove previous messages waiting to be displayed
        const { removePrevious } = {
          ...DEFAULT_OPTIONS,
          ...this.props,
          ...options
        };
        const newMessages = removePrevious ? state.messages.slice(0, 1) : state.messages;

        return {
          messages: newMessages.concat({
            closeFunc,
            key,
            message,
            options
          }),
          open: state.inTransition ? state.open : !state.open,
          inTransition: true
        };
      });

      return closeFunc;
    };

    render() {
      const { children, ...props } = this.props;
      const { message, options, closeFunc } = this.state.messages.length > 0 ? this.state.messages[0] : {};

      // eslint-disable-next-line no-unused-vars
      const { action, removePrevious, closeOnClickaway, ...finalOptions } = {
        ...DEFAULT_OPTIONS,
        ...props,
        ...options
      };

      let newAction = action;
      if (typeof action === 'function') {
        newAction = action({ onClose: closeFunc });
      }

      return (
        <React.Fragment>
          {message && (
            <Snackbar
              {...finalOptions}
              action={newAction}
              open={this.state.open}
              message={message}
              onEntered={this.onEntered}
              onExited={this.onExited}
              onClose={(e, reason) => {
                if (reason === 'clickaway' && !closeOnClickaway) return;
                this.setState({ open: false });
              }}
            />
          )}
          {children}
        </React.Fragment>
      );
    }
  };

// Singleton
const eventEmitter = new EventEmitter();
const SnackbarProvider = createSnackbarProvider(eventEmitter);

export const { addMessage } = eventEmitter;
export default SnackbarProvider;
