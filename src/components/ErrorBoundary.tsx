import React from "react"
import ErrorIcon from "@material-ui/icons/Error";
import Button from "@material-ui/core/Button";
import {createStyles, Typography, withStyles, Theme} from "@material-ui/core"

type ErrorBoundaryProps = {
    className: string,
    classes: any
}

type ErrorBoundaryState = {
    error: Error | null,
    info: React.ErrorInfo | null
}

const styles = (theme : Theme) => createStyles({
    errorContainer: {
        padding: "20px",
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    actionButton: {
        paddingTop: "20px"
    }

});

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

    state: Readonly<ErrorBoundaryState> = {
        error: null, info: null
     };

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        this.setState({
            error: error,
            info: info
        })
    }

    render() {
        if (this.state.info) {

            return (
                // @ts-ignore
                <div className={this.props.className}>
                    <div className={this.props.classes.errorContainer}>
                        <ErrorIcon color="secondary" style={{fontSize: 90}}/>
                        <Typography variant="h2">Sorry</Typography>
                        <Typography variant="h5">Something went wrong</Typography>
                        <div className={this.props.classes.actionButton}>
                            <Button variant="outlined"
                                    size="large"
                                    onClick={() => window.location.replace("/")}>
                                Go to main page
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children;
    }
}

export default withStyles(styles)(ErrorBoundary);