import { message } from "antd";
import moment from 'moment'

const handleError = (fetchObj, errorMessage, successMessage = null) => {
    if (fetchObj.error) {
        console.error(fetchObj.error);
        message.error(errorMessage);
    } else if (successMessage !== null) {
        message.success(successMessage);
    }
    return fetchObj.error;
}

const holidayComparator = (holiday1, holiday2) => {
    let now = moment().startOf('day')
    let dif1 = moment(holiday1.date).diff(now, 'days');
    let dif2 = moment(holiday2.date).diff(now, 'days');
    if (holiday1.date.getTime() === holiday2.date.getTime()) return 0;
    // if today is between holiday1 and holiday2
    if (dif1 < 0 ^ dif2 < 0) return dif1 < dif2 ? 1 : -1;
    // if today is either sooner or later than both holiday1 and holiday2
    return dif1 < dif2 ? -1 : 1
}

export {handleError, holidayComparator}
