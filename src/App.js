import React from 'react'
import { compose, lifecycle } from 'recompose'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import SnackbarProvider from './util/SnackbarProvider'

import Main from './pages/Main'

const Black = {
  50: '#9e9e9e',
  100: '#757575',
  200: '#616161',
  300: '#424242', // light
  400: '#363636',
  500: '#202020', // main Used as main in palette by material ui (also in material design docs)
  600: '#131313',
  700: '#000000', // dark Used as hover state by material ui. Since its black the 800 and 900 is also black.
  800: '#000000',
  900: '#000000',
  A100: '#FFFFFF',
  A200: '#AAAAAA',
  A400: '#616161',
  A700: '#000000'
}

const Orange = {
  50: '#fdefe0',
  100: '#fad7b3',
  200: '#f7bd80',
  300: '#f4a34d',
  400: '#f18f26',
  500: '#ef7b00',
  600: '#ed7300',
  700: '#eb6800',
  800: '#e85e00',
  900: '#e44b00',
  A100: '#fad7b3',
  A200: '#f4a34d', // light
  A400: '#ef7b00', // main
  A700: '#eb6800' // dark
}

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: Black,
    secondary: Orange
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        padding: "8px 16px",
        fontSize: 14,
      },
    },
  },
})

// TODO
const PageNotFound = () => <div>404</div>

const App = () => (
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider />
      <Switch>
        <Route exact path='/' component={Main} />
        <Route
          exact
          path='/object-fact-query/:objectType/:objectValue/'
          component={Main}
        />
        <Route
          exact
          path='/gremlin/:objectType/:objectValue/:query/'
          component={Main}
        />
        <Route
          exact
          path='/graph-query/:objectType/:objectValue/:query/'
          component={Main}
        />
        <Route component={PageNotFound} />
      </Switch>
    </MuiThemeProvider>
  </BrowserRouter>
)

export default compose(
  lifecycle({
    // componentDidCatch (error, info) {
    // }
  })
)(App)
