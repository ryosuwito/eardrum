import React from 'react';

import { Switch, Route, useRouteMatch } from 'react-router-dom';

import RequestDetails from './RequestDetails';
import RequestList from './RequestList';

const OKRApp = () => {
  let { path } = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route exact path={path} component={RequestList} />
        <Route path='/performance/:requestId/details' component={RequestDetails} />
      </Switch>
    </div>
  );
};

export default OKRApp;
