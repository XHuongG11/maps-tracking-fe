import deviceApi from "./api/deviceApi.js";
import * as L from "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js";
import Toastify from "https://cdn.jsdelivr.net/npm/toastify-js@1.12.0/src/toastify-es.js";

// Khởi tạo bản đồ, đặt tâm ở HCM
const map = L.map("map").setView([10.762622, 106.660172], 15);

// Thêm lớp bản đồ nền
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
}).addTo(map);

// elements
var deviceSelect = document.getElementById("deviceSelect");
const calendar = document.getElementById("date");
const btnView = document.getElementById("btnViewLocation");
var markers = [];
var polyline = undefined;

// load devices
function loadDevices() {
  deviceApi
    .getDevices()
    .then((response) => {
      console.log(response);
      response.forEach((d) => {
        const option = document.createElement("option");
        option.value = d.id;
        option.textContent = d.name;
        deviceSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
document.onload = loadDevices();

// set ngày hiện tại cho date
const today = new Date().toISOString().split("T")[0];
calendar.value = today;

// gọi api tìm kiếm device location
btnView.onclick = async () => {
  // remove markers and polylines
  markers.forEach((marker) => marker.remove());
  if (polyline != undefined) polyline.remove();

  try {
    const deviceID = deviceSelect.value;
    const date = calendar.value;
    const locations = await deviceApi.getDeviceLocationByDate(deviceID, date);
    if (locations.length == 0) {
      Toastify({
        text: "Không tìm thấy vị trí nào.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#facc15",
      }).showToast();
      return;
    }

    var latLngArr = [];

    locations.forEach((location) => {
      latLngArr.push([location.latitude, location.longitude]);

      markers.push(
        L.marker([location.latitude, location.longitude])
          .addTo(map)
          .bindPopup(`Time: ${location.timestamp}`)
      );
    });

    // polyline = L.polyline(latLngArr, { color: "red" }).addTo(map);
  } catch (error) {
    console.log(error);
  }
};

// disable btn View
deviceSelect.onchange = (e) => {
  const selectedValue = e.target.value;
  if (selectedValue == "null") {
    btnView.disabled = true;
  } else btnView.disabled = false;
};
