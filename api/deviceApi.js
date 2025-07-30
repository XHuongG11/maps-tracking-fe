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
};
