import React from "react";
import Grid from "@material-ui/core/Grid";
import ObjectType from "../../components/ObjectType";
import ObjectValueAutosuggest from "../../components/ObjectValueAutosuggest";
import Button from "@material-ui/core/Button";
import {observer} from "mobx-react";
import SearchStore from "./SearchStore";
import QueryAutoSuggest from "./QueryAutoSuggest";

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
                    <QueryAutoSuggest
                     required={false}
                     fullWidth
                     placeholder='Query'
                     label='Graph query'
                     helperText={'A Graph query, like g.outE()'}
                     {...store.queryInput}/>

            </Grid>
            <Grid item xs={12}>
                <Button type='submit'>Search</Button>
                <Button onClick={e => store.clearGraph()}>Clear graph</Button>
            </Grid>
        </Grid>
    </form>
);


export default observer(Search);
