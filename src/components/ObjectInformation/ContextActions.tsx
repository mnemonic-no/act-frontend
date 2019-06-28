import React from 'react'
import {Button, createStyles, Grid, Theme, Tooltip, Typography} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {ContextAction} from "../../pages/Details/DetailsStore";

const styles = (theme: Theme) => createStyles({
    items: {
        maxHeight: 100,
        overflow: 'scroll',
        padding: theme.spacing.unit
    }
});

const ContextActions = ({actions, classes}: { actions: Array<ContextAction>, classes: any }) => {

    if (!actions || actions.length === 0) return null;

    return (
        <>
            <Typography variant='body1' gutterBottom>
                Actions
            </Typography>
            <Grid container spacing={8} className={classes.items}>
                {actions.map(action => {
                    return (
                        <Grid item key={action.name}>
                            <Tooltip title={action.description}>
                                <Button
                                    size='small'
                                    variant='outlined'
                                    target="_blank"
                                    onClick={action.onClick}
                                    href={action.href}>
                                    {action.name}
                                </Button>
                            </Tooltip>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    )
};

export default withStyles(styles)(ContextActions);