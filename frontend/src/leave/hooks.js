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


// execute() return data and error since data and error of the outer object are asynchronously updated
const actionOnCall = (axiosConfigGetter, dataExtractor = response => response, initialData = null, defaultOnError = {}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);

  const execute = async (options) => {
    setLoading(true)
    let returnData = initialData;
    let returnError = null;
    try {
      returnData = dataExtractor(await axios(axiosConfigGetter(options)))
    } catch (e) {
      let status = e.response.status;
      if (defaultOnError[status] !== undefined) {
        returnData = defaultOnError[status]
      } else {
        returnError = e
      }
    } finally {
      setLoading(false);
      setData(returnData);
      setError(returnError);
      return {data: returnData, error: returnError}
    }
  };

  return { execute, loading, data, error };
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
}, [], {404: []})

// options: { date: string }
const useLeaveUsers = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveUsers(options.date, options.country_code),
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

// options: { date: string }
const useGetCountries = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.getCountries(),
}), response => {
  return response.data;
}, [])

// options: { year: string, holidays: array of dates}
const usePatchHolidays = () => actionOnCall(options => ({
  method: 'patch',
  url: routes.api.holidays(options.year, options.country),
  data: {holidays: options.holidays.map(date => date.id).join(" ")}
}))

const useHolidays = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.holidays(options.year, options.country_code),
}), response => {
  let unsortedHolidays = response.data.map((item) => ({
    "id" : item,
    "date": moment(item, DATE_FORMAT.VALUE).toDate(),
  }))

  unsortedHolidays.sort(holidayComparator);
  return unsortedHolidays;
}, [], {404: []})

// options: { year: string }
const useRecalculateMasks = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.recalculateMasks(),
  data: { year: options.year }
}))

// options: { year: string }
const useGetCapacities = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.getCapacity(options.year),
}), response => {
  return [Object.entries(response.data.capacities).map(([key, value]) => ({
    id: key,
    user: key,
    ...value,
  })), response.data.capacities]
}, [[], {}], {404: [[], {}]})

// options: { year: int, user: string, typ: string, limit: number }
const usePostCapacities = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.updateCapacity(options.year),
  data: {
    user: options.user,
    typ: options.typ,
    limit: options.limit,
  },
}))

// options: { user: string, typ: string, days: number }
const useAddManualLeave = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.addManualLeave(),
  data: {
    user: options.user,
    typ: options.typ,
    days: options.days,
  },
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
  useGetCapacities,
  usePostCapacities,
  useGetCountries,
  useAddManualLeave
}
