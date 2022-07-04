export default {
    api: {
        context: () => '/api/leave/context/',
        currentUser: () => '/api/account/current_user/',
        leaveAll: (options) => {
            if (!options) return '/api/leave/';
            let query = Object.entries(options)
                            .map(option => `${option[0]}=${encodeURIComponent(option[1])}`).join('&')
            return `/api/leave/?${query}`;
        },
        leaveDetail: (id) => `/api/leave/${id}/`,
        statistics: (year) => `/api/leave/statistics/?year=${year}`,
        holidays: (year, country_code) => `/api/leave/holidays/?year=${year}&country_code=${country_code?country_code:'SG'}`,
        leaveUsers: (date, country_code) => `/api/leave/leave_users?date=${date}&country_code=${country_code?country_code:'SG'}`,
        getCountries: () => `/api/leave/get_countries`,
        recalculateMasks: () => `/api/leave/recalculate_masks/`,
        getCapacity: (year) => `/api/leave/get_capacity/?year=${year}`,
        addManualLeave: () => `/api/leave/manual_leave/`,
        updateCapacity: (year) => `/api/leave/update_capacity/?year=${year}`,
    }
}
