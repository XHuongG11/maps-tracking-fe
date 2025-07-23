import axioslient from "./axiosClient.js";

const deviceApi = {
  getDevices() {
    const url = "/devices";
    return axioslient.get(url);
  },
  getDeviceLocationByDate(deviceID, date) {
    const url = `/locations/`;
    return axioslient.get(url, { params: { deviceID, date } });
  },
};

export default deviceApi;
