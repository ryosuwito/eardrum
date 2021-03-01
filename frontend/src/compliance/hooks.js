import { useState, useEffect } from 'react';

import axios from 'axios';

import routes from './routes';


function FormA(optionValue, accounts) {
  this.optionValue = optionValue || null;
  this.accounts = accounts || [];

  return this;
}

function newFormA() {
  return new FormA(null, []);
}

function dataFactory(data, formType) {
  switch(formType) {
    case 'a':
      return data === null? newFormA(): new FormA(data.json_data.optionValue, data.json_data.accounts);
    case 'b':
      return {};
  } 

  return null;
}


function useFetchOne(pk, formType) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function awaitAndSet(promise) {
    try {
      const res = await promise;
      setData(dataFactory(res.data, formType));
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  useEffect(() => {
    if (pk === null || pk === undefined) {
      setData(dataFactory(null, formType));
    } else {
      awaitAndSet(axios.get(routes.api.detailsURL(pk)));
    }
  }, []);

  return [data, error]
}


export {
  useFetchOne,
}