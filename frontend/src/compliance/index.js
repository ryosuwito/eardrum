import React from 'react';

import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import Compliance from './Compliance';
import FormAEdit from './FormAEdit';
import FormAView from './FormAView';


export default function () {
  let { path, url } = useRouteMatch();
  console.log(path, url);

  return (
    <div>
      <Switch>
        <Route exact path={ path } component={ Compliance } />
        <Route exact path={ `${path}/:typ` } component={ Compliance }/>
        <Route exact path={ `${path}/a/new` } component={ FormAEdit }/>
        <Route exact path={ `${path}/a/:pk/view` } component={ FormAView }/>
        <Route exact path={ `${path}/a/:pk/edit` } component={ FormAEdit }/>
      </Switch>
    </div>
  )
}
