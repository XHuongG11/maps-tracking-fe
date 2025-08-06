window.deviceApi = {
  getDevices() {
    const url = "/devices";
    return axiosClient.get(url);
  },
  getDeviceLocationByDate(deviceID, date, types) {
    let query = `deviceID=${deviceID}&date=${date}`;
    types.forEach((t) => {
      query += `&types=${t}`;
    });
    const url = `/locations?${query}`;
    return axiosClient.get(url);
  },
  login(username, PIN) {
    const data = { username: username, PIN: PIN };
    const url = "/login";
    return axiosClient.post(url, data);
  },
  authenticate() {
    url = "/authenticate";
    return axiosClient.get(url);
  },
};
