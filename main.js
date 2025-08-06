// load map
let map;
function loadMap(type) {
  if (map) {
    map.remove();
    map = null;
    console.log("revome");
  }
  if (type === "openstreetmap") {
    // Khởi tạo bản đồ, đặt tâm ở HCM
    map = L.map("map").setView([10.762622, 106.660172], 15);
    // Thêm lớp bản đồ nền
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);
  } else if (type === "maptiler") {
    map = L.map("map").setView([10.762622, 106.660172], 15);
    L.tileLayer(
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=rGCv98tSlmgeHTMD0HJz",
      {
        attribution:
          '<a href="https://www.maptiler.com/copyright/">MapTiler</a> ' +
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 20,
      }
    ).addTo(map);
  } else if (type === "cartobasemaps") {
    map = L.map("map").setView([10.762622, 106.660172], 15);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);
  }
}
const typeMapSelected = document.getElementById("typeMap");
typeMapSelected.addEventListener("change", () => {
  loadMap(typeMapSelected.value);
});

// elements
var deviceSelect = document.getElementById("deviceSelect");
const calendar = document.getElementById("date");
const btnView = document.getElementById("btnViewLocation");

// enum type marker
const EMarkerType = {
  1: L.icon({
    iconUrl: `images/blue-marker.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "images/shadow-marker.png",
    shadowSize: [18, 16],
    shadowAnchor: [0, 16],
  }),
  2: L.icon({
    iconUrl: `images/green-marker.png`,
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
    iconUrl: `images/red-marker.png`,
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
document.onload = deviceApi
  .authenticate()
  .then()
  .catch((err) => {
    window.location.href = "login.html";
  });
document.onload = loadDevices();
document.onload = loadMap(typeMapSelected.value);

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

function drawByCluster(data) {
  markersCluster = L.markerClusterGroup();

  geoJsonLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const type = feature.properties.type;
      const icon = EMarkerType[type];

      return L.marker(latlng, { icon });
    },
    onEachFeature: (feature, layer) => {
      const { title, linkInfo } = feature.properties;
      const link = linkInfo
        ? `<a href="${linkInfo}" target="_blank" style="text-decoration: underline; color: blue;">Link info</a><br>`
        : "";
      const content = `${title}. ${link}`;
      layer.bindPopup(content);
      markers.push(layer);
    },
  });

  markersCluster.addLayer(geoJsonLayer);
  map.addLayer(markersCluster);

  map.fitBounds(markersCluster.getBounds());
}
function drawByCanvas(data) {
  markersCanvas = new L.MarkersCanvas();

  markersCanvas.addTo(map);

  markers = data.features.map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const icon = EMarkerType[feature.properties.type];
    const { title, linkInfo } = feature.properties;
    const link = linkInfo
      ? `<a href="${linkInfo}" target="_blank" style="text-decoration: underline; color: blue;">Link info</a><br>`
      : "";
    const content = `${title}. ${link}`;
    return L.marker([lat, lng], { icon }).bindPopup(content);
  });

  markersCanvas.addMarkers(markers);

  // Zoom map đến vùng có marker
  const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
  map.fitBounds(bounds);
}

function resetLayers() {
  if (geoJsonLayer) map.removeLayer(geoJsonLayer);
  if (markersCluster) {
    map.removeLayer(markersCluster);
    markersCluster = null;
  }
  if (markersCanvas) {
    markersCanvas.removeMarkers(markers);
  }
}

let markersCanvas;
let markersCluster;
let markers = [];
let geoJsonLayer;

btnView.onclick = async () => {
  // Xoá layer và các marker cũ nếu có
  resetLayers();

  try {
    const deviceID = deviceSelect.value;
    const date = calendar.value;

    const checkboxes = document.querySelectorAll(
      ".type-container input[type=checkbox]"
    );
    let types = Array.from(checkboxes)
      .filter((c) => c.checked)
      .map((c) => c.value);

    if (types.length === 0) types = ["1", "2", "3", "4", "5"];

    const locations = await deviceApi.getDeviceLocationByDate(
      deviceID,
      date,
      types
    );

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

    // Type view
    const typeView = document.getElementById("typeView").value;

    if (typeView == "group") drawByCluster(geojson);
    else drawByCanvas(geojson);
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
