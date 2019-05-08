import React from "react";
import Grid from "@material-ui/core/Grid";
import ObjectType from "../../components/ObjectType";
import ObjectValueAutosuggest from "../../components/ObjectValueAutosuggest";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {observer} from "mobx-react";
import SearchStore from "./SearchStore";

const Search = ({store}: { store: SearchStore }) => (
    <form
        onSubmit={e => {
            e.preventDefault();
            store.submitSearch();
        }}>
        <Grid container spacing={16}>
            <Grid item xs={12}>
                <ObjectType
                    fullWidth
                    value={store.objectType}
                    onChange={(value: string) => store.objectType = value}/>
            </Grid>
            <Grid item xs={12}>
                <ObjectValueAutosuggest
                    required
                    autoFocus={store.objectValue === ''}
                    fullWidth
                    label={'Object value'}
                    value={store.objectValue}
                    onChange={(value: string) => store.objectValue = value}
                    objectType={store.objectType}/>
            </Grid>

            <Grid item xs={12}>
                <TextField
                    inputProps={{spellCheck: false}}
                    fullWidth
                    label={'Graph query'}
                    helperText={'A Graph query, like g.outE()'}
                    value={store.query}
                    onChange={e => store.query = e.target.value}/>
            </Grid>
            <Grid item xs={12}>
                <Button type='submit'>Search</Button>
                <Button onClick={e => store.clearGraph()}>Clear graph</Button>
            </Grid>
        </Grid>
    </form>
);


export default observer(Search);
