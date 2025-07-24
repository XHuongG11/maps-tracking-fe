window.deviceApi = {
  getDevices() {
    const url = "/devices";
    return axiosClient.get(url);
  },
  getDeviceLocationByDate(deviceID, date) {
    const url = `/locations/`;
    return axiosClient.get(url, { params: { deviceID, date } });
  },
};
