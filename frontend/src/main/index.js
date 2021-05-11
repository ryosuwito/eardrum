import React from 'react';

import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import FAQ from './FAQ';


export default function () {
  let { path } = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route exact path={ path } component={ FAQ } />
      </Switch>
    </div>
  )
}
