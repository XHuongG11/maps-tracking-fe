import axioslient from "./axiosClient.js";

const deviceApi = {
  getDevices() {
    const url = "/devices";
    return axioslient.get(url);
  },
  getDeviceLocationByDate(id, date) {
    const url = `/device-location/${id}/${date}`;
    return axioslient.get(url);
  },
};

export default deviceApi;
