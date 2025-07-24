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
const EMarkerType = {
  1: L.icon({
    iconUrl: `images/red-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
  2: L.icon({
    iconUrl: `images/blue-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
  3: L.icon({
    iconUrl: `images/pink-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
  4: L.icon({
    iconUrl: `images/yellow-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
  5: L.icon({
    iconUrl: `images/green-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
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

function convertLocationsToGeoJSON(locations) {
  return {
    type: "FeatureCollection",
    features: locations.map((location) => ({
      type: "Feature",
      properties: {
        title: location.title,
        type: location.type,
        linkInfo: location.linkInfo,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      geometry: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
    })),
  };
}

btnView.onclick = async () => {
  // Xoá các marker cũ nếu có
  markers.forEach((marker) => marker.remove());
  markers = [];

  try {
    const deviceID = deviceSelect.value;
    const date = calendar.value;
    const locations = await deviceApi.getDeviceLocationByDate(deviceID, date);

    if (locations.length === 0) {
      Toastify({
        text: "Không tìm thấy vị trí nào.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#facc15",
      }).showToast();
      return;
    }

    const geojson = convertLocationsToGeoJSON(locations);

    const geoJsonLayer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const type = feature.properties.type || "default";
        const icon = EMarkerType[type];

        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const { title, linkInfo, latitude, longitude } = feature.properties;
        const link = linkInfo
          ? `<a href="${linkInfo}" target="_blank" style="text-decoration: underline; color: blue;">Link info</a><br>`
          : "";
        const content = `${title}. ${link}`;
        layer.bindPopup(content);
        markers.push(layer);
      },
    });

    geoJsonLayer.addTo(map);
  } catch (error) {
    console.error(error);
  }
};

// disable btn View
deviceSelect.onchange = (e) => {
  const selectedValue = e.target.value;
  if (selectedValue == "null") {
    btnView.disabled = true;
  } else btnView.disabled = false;
};
