import * as React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { ActObjectRef, NamedId } from '../../core/types';
import AccessModeSelector from '../AccessModeSelector';
import DialogError from '../DialogError';
import DialogLoadingOverlay from '../DialogLoadingOverlay';
import DialogStore, { FormUniDirectional } from './DialogStore';
import ObjectValueAutosuggest from '../ObjectValueAutosuggest';

const useStyles = makeStyles((theme: Theme) => ({
  dialogContentRoot: { paddingBottom: '20px' }
}));

const ObjectComp = (props: { title: string; actObject: ActObjectRef }) => {
  return (
    <RoundedBox title={props.title} style={{ padding: '10px' }}>
      <div>
        <TextField
          label="Object Type"
          defaultValue={props.actObject.typeName}
          margin="normal"
          InputProps={{
            readOnly: true
          }}
        />

        <TextField
          label="Object Value"
          defaultValue={props.actObject.value}
          margin="normal"
          InputProps={{
            readOnly: true
          }}
        />
      </div>
    </RoundedBox>
  );
};

const ObjectSelectionComp = observer(
  ({
    title,
    selectionObject,
    validObjectTypes,
    onChange
  }: {
    title: string;
    validObjectTypes: Array<NamedId>;
    selectionObject: ActObjectRef;
    onChange: (obj: ActObjectRef) => void;
  }) => {
    if (!selectionObject.typeName) {
      return <div>Missing type for selection object</div>;
    }

    return (
      <RoundedBox style={{ padding: '10px', border: '2px solid black' }} title={title}>
        <TextField
          label="Object Type"
          fullWidth
          select
          margin="normal"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ native: true }}
          value={selectionObject.typeName}
          onChange={e => {
            const newTypeName = e.target.value;
            const newObjectType = validObjectTypes.filter(ot => ot.name === newTypeName)[0];
            return onChange({ ...selectionObject, typeName: newObjectType.name });
          }}>
          {validObjectTypes.map(({ id, name }: any) => (
            <option key={id} value={name}>
              {name}
            </option>
          ))}
        </TextField>

        <div>
          <ObjectValueAutosuggest
            required
            autoFocus={selectionObject.value === ''}
            fullWidth
            label={'Object value'}
            value={selectionObject.value}
            onChange={(value: string) => onChange({ ...selectionObject, value: value })}
            objectType={selectionObject.typeName}
          />
        </div>
      </RoundedBox>
    );
  }
);

const RoundedBox = ({ children, style, title }: any) => {
  return (
    <div>
      {title && (
        <Typography align="center" color="primary" variant="subtitle1">
          {title}
        </Typography>
      )}
      <div
        style={{
          ...{ border: `1px solid gray`, borderRadius: '4px' },
          ...style
        }}>
        {children}
      </div>
    </div>
  );
};

const Arrow = ({ direction, label }: { direction: string; label: string }) => {
  const headHeight = 20;
  const lineThickness = 6;

  const Line = () => (
    <div
      style={{
        width: '100%',
        margin: `${(headHeight - lineThickness) / 2}px 0`,
        backgroundColor: 'gray',
        height: `${lineThickness}px`
      }}
    />
  );

  const RightArrow = () => (
    <svg viewBox={'0 0 10 10'} height={headHeight}>
      <polygon points="0,0 10,5 0,10" fill="gray" />
    </svg>
  );

  const LeftArrow = () => (
    <svg viewBox={'0 0 10 10'} height={headHeight}>
      <polygon points="10,0 0,5 10,10" fill="gray" />
    </svg>
  );

  const Label = ({ label }: { label: string }) => (
    <Typography
      style={{
        position: 'absolute',
        top: `-${lineThickness + 6}px`,
        textAlign: 'center',
        width: '100%'
      }}>
      {label}
    </Typography>
  );

  switch (direction) {
    case 'right':
      return (
        <div style={{ display: 'flex', position: 'relative' }}>
          <Label label={label} />
          <Line />
          <RightArrow />
        </div>
      );
    case 'left':
      return (
        <div style={{ display: 'flex', position: 'relative' }}>
          <Label label={label} />
          <LeftArrow />
          <Line />
        </div>
      );
    case 'both':
      return (
        <div style={{ display: 'flex', position: 'relative' }}>
          <Label label={label} />
          <LeftArrow />
          <Line />
          <RightArrow />
        </div>
      );
    default:
      return <div>Unsupported arrow type</div>;
  }
};

const OneLeggedFact = observer(({ store }: { store: DialogStore }) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: '10px'
      }}>
      <div style={{ flex: '1' }}>
        <ObjectComp actObject={store.selectedObject} title="Source" />
      </div>

      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
        <Arrow direction="right" label={store.selectedFactTypeName ? store.selectedFactTypeName : ''} />
      </div>

      <div style={{ flex: '1', alignSelf: 'center' }}>
        <RoundedBox style={{ padding: '10px' }}>
          <TextField
            inputProps={{ spellCheck: false }}
            fullWidth
            label={'Value'}
            value={store.formOneLegged.value}
            onChange={e => (store.formOneLegged.value = e.target.value)}
          />
        </RoundedBox>
      </div>
    </div>
  );
});

const BiDirectionalFact = observer(({ store }: { store: DialogStore }) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: '10px'
      }}>
      <div style={{ flex: '1' }}>
        <ObjectComp actObject={store.selectedObject} title="Source" />
      </div>

      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
        <Arrow direction="both" label={store.selectedFactTypeName ? store.selectedFactTypeName : ''} />
      </div>

      <div style={{ flex: '1' }}>
        {store.formBidirectional && (
          <ObjectSelectionComp
            selectionObject={store.formBidirectional.otherObject}
            validObjectTypes={store.formBidirectional.validOtherObjectTypes}
            title="Destination"
            onChange={store.onFormBidirectionalChange}
          />
        )}
      </div>
    </div>
  );
});

const UniDirectionalFact = observer(
  ({
    store,
    form,
    onChange,
    onSwapClick
  }: {
    store: DialogStore;
    form: FormUniDirectional;
    onChange: (obj: ActObjectRef) => void;
    onSwapClick: Function | undefined;
  }) => {
    const SourceComp = observer(() => {
      if (form.isSelectionSource) {
        return <ObjectComp title="Source" actObject={store.selectedObject} />;
      } else {
        return (
          <ObjectSelectionComp
            title="Source"
            selectionObject={form.otherObject}
            validObjectTypes={form.validOtherObjectTypes}
            onChange={onChange}
          />
        );
      }
    });

    const DestinationComp = observer(() => {
      if (!form.isSelectionSource) {
        return <ObjectComp title="Destination" actObject={store.selectedObject} />;
      } else {
        return (
          <ObjectSelectionComp
            title="Destination"
            selectionObject={form.otherObject}
            validObjectTypes={form.validOtherObjectTypes}
            onChange={onChange}
          />
        );
      }
    });

    return (
      <div style={{ display: 'flex', paddingTop: '10px' }}>
        <div style={{ flex: '1' }}>
          <SourceComp />
        </div>
        <div
          style={{
            flex: '1',
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
          {onSwapClick && (
            <div
              style={{ position: 'absolute', top: '1.5rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Fab onClick={() => onSwapClick()} size="small" type="button" color="secondary">
                <SwapHorizIcon />
              </Fab>
            </div>
          )}
          <Arrow direction="right" label={store.selectedFactTypeName ? store.selectedFactTypeName : ''} />
        </div>

        <div style={{ flex: '1' }}>
          <DestinationComp />
        </div>
      </div>
    );
  }
);

const FactComp = observer(({ store }: { store: DialogStore }) => {
  switch (store.selectedFactTypeCategory) {
    case 'oneLegged':
      return <OneLeggedFact store={store} />;
    case 'biDirectional':
      return <BiDirectionalFact store={store} />;
    case 'uniDirectional':
      if (store.formUniDirectional) {
        return (
          <UniDirectionalFact
            store={store}
            form={store.formUniDirectional}
            onChange={store.onFormUniDirectionalChange}
            onSwapClick={store.canSwap ? store.onSwapClick : undefined}
          />
        );
      }
      return null;
    default:
      return null;
  }
});

const DialogComp = ({ store }: IDialogProps) => {
  const classes = useStyles();

  return (
    <Dialog open={store.isOpen} onClose={() => store.onClose()} disableBackdropClick maxWidth="sm" fullWidth>
      <form
        onSubmit={e => {
          e.preventDefault();
          store.onSubmit();
        }}>
        <DialogTitle>Create Fact</DialogTitle>
        <DialogContent classes={{ root: classes.dialogContentRoot }}>
          {/* Loading state */}
          {store.isSubmitting && <DialogLoadingOverlay />}

          {/* Error state */}
          {store.error && <DialogError error={store.error} />}

          <TextField
            label="Fact type"
            value={store.selectedFactTypeName}
            onChange={v => store.onFactTypeChange(v.target.value)}
            select
            SelectProps={{ native: true }}>
            {store.factTypes.map(x => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </TextField>

          <div style={{ marginTop: '20px' }}>
            <FactComp store={store} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <AccessModeSelector value={store.accessMode} onChange={(v: any) => store.onAccessModeSelectorChange(v)} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <TextField
              multiline
              fullWidth
              value={store.comment}
              onChange={v => store.onCommentChange(v.target.value)}
              label="Comment"
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => store.onClose()}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface IDialogProps {
  store: DialogStore;
}

export default observer(DialogComp);
