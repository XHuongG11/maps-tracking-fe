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

// enum type marker
const ETypeMarker = {
  1: "red-marker",
  2: "blue-marker",
  3: "pink-marker",
  4: "yellow-marker",
  5: "green-marker",
};

// load devices
function loadDevices() {
  deviceApi
    .getDevices()
    .then((response) => {
      console.log(response);
      response.forEach((d) => {
        const option = document.createElement("option");
        option.value = d.deviceID;
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
const today = new Date("2025-07-02").toISOString().split("T")[0];
calendar.value = today;

// gọi api tìm kiếm device location
btnView.onclick = async () => {
  // remove markers and polylines
  markers.forEach((marker) => marker.remove());

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

    locations.forEach((location) => {
      const latitude = location.latitude;
      const longitude = location.longitude;

      var markerIcon = L.icon({
        iconUrl: `images/${ETypeMarker[location.type]}.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        shadowUrl: "images/shadow-marker.png",
        shadowSize: [18, 16],
        shadowAnchor: [0, 16],
      });

      if (location.linkInfo != null)
        markers.push(
          L.marker([latitude, longitude], {
            icon: markerIcon,
          }).addTo(map).bindPopup(`${location.title}.
            <a href=${location.linkInfo} target="_blank" style="text-decoration: underline; color: blue;">
            LinkInfo.</a>
            <a href=https://www.google.com/maps?q=${latitude},${longitude} target="_blank" style="text-decoration: underline; color: blue;">
            GoogleMaps</a>
            `)
        );
      else
        markers.push(
          L.marker([location.latitude, location.longitude], {
            icon: markerIcon,
          }).addTo(map).bindPopup(`${location.title}.
               <a href=https://www.google.com/maps?q=${latitude},${longitude} target="_blank" style="text-decoration: underline; color: blue;">
            GoogleMaps</a>`)
        );
    });
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
