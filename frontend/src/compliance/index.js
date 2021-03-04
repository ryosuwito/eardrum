import React from 'react';

import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import Compliance from './Compliance';
import FormAEdit from './FormAEdit';
import FormAView from './FormAView';
import FormBEdit from './FormBEdit';
import FormBView from './FormBView';
import FormCEdit from './FormCEdit';
import FormCView from './FormCView';
import FormDView from './FormDView';
import FormDEdit from './FormDEdit';


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
        <Route exact path={`${path}/b/new`} component={FormBEdit} />
        <Route exact path={`${path}/b/:pk/view`} component={FormBView} />
        <Route exact path={`${path}/b/:pk/edit`} component={FormBEdit} />
        <Route exact path={`${path}/c/new`} component={FormCEdit} />
        <Route exact path={`${path}/c/:pk/view`} component={FormCView} />
        <Route exact path={`${path}/c/:pk/edit`} component={FormCEdit} />
        <Route exact path={`${path}/d/new`} component={FormDEdit} />
        <Route exact path={`${path}/d/:pk/view`} component={FormDView} />
        <Route exact path={`${path}/d/:pk/edit`} component={FormDEdit} />
      </Switch>
    </div>
  )
}
