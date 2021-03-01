import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import { SnackbarProvider } from 'notistack';

import rootReducer from './reducers/index'; 
import App from './App';
import middlewares from './middlewares';

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares),
)

// Config axios
// axios.defaults.baseURL = axiosConfig.baseURL;
// axios.defaults.headers.post['Content-Type'] = axiosConfig.headers.post['Content-Type'];
// axios.defaults.proxy = axiosConfig.proxy;
axios.interceptors.request.use(config => {
  if (localStorage.getItem('auth')) {
    config.headers.common['Authorization'] = 'JWT ' + localStorage.getItem('auth');
  }

  return config;
})


ReactDOM.render(
  <Provider store={ store }>
    <SnackbarProvider maxSnack={ 5 } anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={ 2500 }>
      <App />
    </SnackbarProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
