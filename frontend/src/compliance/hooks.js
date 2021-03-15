import { useState, useEffect } from 'react';

import axios from 'axios';

import routes from './routes';
import messages from './messages';
import moment from 'moment';

const dateFormat = 'DD/MM/YYYY';

function FormA(optionValue, submissionDate, accounts, submitBy) {
  this.optionValue = optionValue || null
  this.accounts = accounts || []
  this.submissionDate = submissionDate || null
  this.submitBy = submitBy || null

  return this
}

function newFormA() {
  return new FormA(null, moment(new Date()).format(dateFormat), [], null)
}

function FormB(optionValue, year, fileList, submitBy) {
  this.optionValue = optionValue || null
  this.year = year || null
  this.fileList = fileList || []
  this.submitBy = submitBy || null

  return this
}

function newFormB() {
  return new FormB(null, new Date().getFullYear(), [], null)
}

function FormC(optionValue, quarter, year, tickers, submitBy) {
  this.optionValue = optionValue || null
  this.quarter = quarter || null
  this.year = year || null
  this.submitBy = submitBy || null

  // tickers: short form for Stock tickers
  this.tickers = tickers || []

  return this
}

function newFormC() {
  return new FormC(null, messages.c.text.quarters[0], new Date().getFullYear(), [], null)
}

function FormD(submissionDate, issuers, submitBy) {
  this.submissionDate = submissionDate || null
  this.issuers = issuers || []
  this.submitBy = submitBy || null

  return this
}

function newFormD() {
  return new FormD(moment(new Date()).format(dateFormat), [], null)
}

function dataFactory(data, formType) {
  switch(formType) {
    case 'a':
      return data === null? newFormA(): new FormA(data.json_data.optionValue, data.json_data.submissionDate, data.json_data.accounts, data.submit_by);
    case 'b':
      return data === null
        ? newFormB()
        : new FormB(data.json_data.optionValue, data.json_data.year, data.json_data.fileList, data.submit_by)
    case 'c':
      return data === null
        ? newFormC()
        : new FormC(
            data.json_data.optionValue,
            data.json_data.quarter,
            data.json_data.year,
            data.json_data.tickers,
            data.submit_by
          )
    case 'd':
        return data === null ? newFormD() : new FormD(data.json_data.submissionDate, data.json_data.issuers, data.submit_by)
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

function useDeleteOne(pk) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const func = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(routes.api.detailsURL(pk));
      setResponse(res);
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  return [func, loading, response, error];
}

function useCurrentUser() {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(routes.api.currentUser())
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);
  return [loading, response, error];
}

function useUpdateOne(pk) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const url = pk ? routes.api.detailsURL(pk) : routes.api.list();
  const method = pk ? 'PATCH' : 'POST';

  const save = (data) => {
    setLoading(true);
    axios({ url, data, method })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return [save, loading, response, error];
}


export {
  useFetchOne,
  useDeleteOne,
  useCurrentUser,
  useUpdateOne,
}
