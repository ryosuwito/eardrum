import React from 'react';

import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import OKRDetail from './OKRDetail';
import OKRList from './OKRList';

const OKRApp = () => {
  let { path } = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route exact path={path} component={OKRList} />
        <Route exact path={`${path}/:okrId`} component={OKRDetail} />
      </Switch>
    </div>
  )
}

export default OKRApp;
