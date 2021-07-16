import { createContext, useEffect, useState } from 'react'

import axios from 'axios';
import moment from 'moment';
import routes from './routes';
import { DATE_FORMAT } from './constants';
import { holidayComparator } from './helpers';

const LeaveContext = createContext({
  currentUser: null,
  leaveTypes: null, 
  allUsers: null,
})

const fetchOnStart = (route, dataExtractor = response => response) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(route)
          .then(res => setData(dataExtractor(res)))
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
  }, []);

  return { loading, data, error };
}

const useLeaveContext = () => fetchOnStart(routes.api.context(), response => response.data);

const useCurrentUser = () => fetchOnStart(routes.api.currentUser(), response => response.data);



const actionOnCall = (axiosConfigGetter, dataExtractor = response => response, initialData = null ) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(initialData);
  const [error, setError] = useState(null);

  const execute = async (options) => {
    setLoading(true)
    await axios(axiosConfigGetter(options))
      .then((response) => setResponse(dataExtractor(response)))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return { execute, loading, data: response, error };
}
 
// options: { status: string, year: int, leaveContext: obj }
const useGetLeaveAll = (context) => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveAll(options)
}), response => {
  return response.data.map(item => ({
    id: item.id,
    user: item.user,
    startdate: moment(item.startdate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
    enddate: moment(item.enddate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
    type: context.leaveTypesMap[item.typ],
    half: item.half,  
    status: item.status,
    note: item.note,
  }))
}, [])

// options: { data: object }
const useAddLeave = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.leaveAll(),
  data: {
    user: options.data.user,
    typ: options.data.type,
    startdate: moment(options.data.startdate).format(DATE_FORMAT.VALUE),
    enddate: moment(options.data.enddate).format(DATE_FORMAT.VALUE),
    half: options.data.half,
    note: options.data.note,
  },
}))

// options: { id: int }
const useDeleteLeave = () => actionOnCall(options => ({
  method: 'delete', 
  url: routes.api.leaveDetail(options.id),
}))

// options: { id: int, data: object }
const useUpdateLeave = () => actionOnCall(options => ({
  method: 'patch',
  url: routes.api.leaveDetail(options.id),
  data: options.data,
}))

// options: { year: int }
const useStat = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.statistics(options.year),
}), response => {
  return response.data.stats.map((item) => ({
    ...item,
    id: item.user,
  }))
}, [])

// options: { date: string }
const useLeaveUsers = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveUsers(options.date),
}), response => {
  let data = [];
  const toStatus = (str) => {
    let morningOff = (str[0] !== '-')
    let afternoonOff = (str[1] !== '-')
    if (morningOff && afternoonOff) return "all-day off";
    else if (morningOff) return "morning off";
    else if (afternoonOff) return "afternoon off";
    else return '';
  }
  for (const group in response.data.leave_status) {
    let obj = {}
    // remove prefix "leave_app_" (if any) and replace all underscores with blank spaces
    obj.group = group.replace(/[_]/g, (m) => (m === '_' ? " " : m))
    obj.users = Object.entries(response.data.leave_status[group])
                        .map(entry => ({name: entry[0], status: toStatus(entry[1])}))
    data.push(obj)
  }
  return data;
}, [])

// options: { year: string, holidays: array of dates}
const usePatchHolidays = () => actionOnCall(options => ({
  method: 'patch',
  url: routes.api.holidays(options.year),
  data: {holidays: options.holidays.map(date => date.id).join(" ")}
}))

function useHolidays() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError]= useState(null);

  const execute = async (options) => {
    setLoading(true);
    try {
      let response = await axios({
        method: 'get', 
        url: routes.api.holidays(options.year),
      })
        
      let unsortedHolidays = response.data.map((item) => ({
        "id" : item,
        "date": moment(item, DATE_FORMAT.VALUE).toDate(),
      }))

      unsortedHolidays.sort(holidayComparator);
      setData(unsortedHolidays)
    } catch(error) {
      // year could be either an integer or a string representing an integer
      if ((Number.isInteger(options.year) || !isNaN(options.year)) && error.response && error.response.status === 404) {
        setData([]);
      } else {
        setError(error)
      }
    }
    setLoading(false);
  }

  return { execute, loading, data, error };
}

// options: { year: string }
const useRecalculateMasks = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.recalculateMasks(),
  data: { year: options.year }
}))

export {
  LeaveContext,
  useLeaveContext, 
  useCurrentUser,
  useGetLeaveAll, 
  useAddLeave, 
  useUpdateLeave, 
  useDeleteLeave,
  useStat,
  useHolidays,
  useLeaveUsers,
  useRecalculateMasks,
  usePatchHolidays,
}
