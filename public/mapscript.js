var host = window.location.origin;
// Replace "YOURAPPTOKENHERE" with your actual app token
const appToken = "8bXBtSpWDBQfz2iTlipUrmqeJ";

// Map for each incident
// 38.784915, -76.872117

async function incidentMap() {
  const map = L.map('map', {
    center: [38.784915, -76.872117],
    zoom: 12
  });

  // Add a tile layer (you can use your preferred tile layer)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Define the coordinates for Prince George's County
  var PrinceGeorgeCounty = [
    [38.535481, -76.675549],
    [38.812923, -76.713775],
    [38.908053, -76.675312],
    [39.067857, -76.836813],
    [39.089178, -76.824453],
    [39.128605, -76.888998],
    [38.964357, -77.002981],
    [38.892804, -76.910599],
    [38.789676, -77.041821],
    [38.717835, -77.047127],
    [38.702966, -77.087616],
    [38.620206, -77.05189],
    [38.656018, -76.940543],
    [38.658133, -76.863024],
    [38.616448, -76.747235],
    [38.557499, -76.739259],
    [38.535481, -76.675549],
  ];

  // Create a red polygom with the defined coordinates
  var polygon = L.polygon(PrinceGeorgeCounty, { color: "red" }).addTo(
    map
  );
  // Add a click event listener to the polygon
polygon.on('click', function () {
  // Redirect to a different page when the polygon is clicked
  window.location.href = 'detail_incident.html';
});


  // Function to shuffle array elements
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
  // Fetch data from the API
  fetch("https://data.princegeorgescountymd.gov/resource/xjru-idbe.json?$limit=50&$$app_token=" + appToken)
    .then((response) => response.json())
    .then((data) => {
      // Shuffle the data array to get a random order
      var shuffledData = shuffleArray(data);

      // Create markers with popups for the unique incidents
      for (var i = 0; i < 5; i++) {
        var incident = shuffledData[i];
        var lat = parseFloat(incident.latitude);
        var lon = parseFloat(incident.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          var marker = L.marker([lat, lon]).addTo(map);
          marker.bindPopup(
            `<b>Date:</b> ${incident.date}<br>
             <b>Incident Type:</b> ${incident.clearance_code_inc_type}<br>
             <b>Address:</b> ${incident.street_address}<br>`
          );
        }
      }
    })
    .catch((error) => console.error("Error fetching data:", error));

  // Zoom the map to fit the bounds of the polygon
  map.fitBounds(polygon.getBounds());
}

window.onload = incidentMap;

// Keep track of the last retrieved date
let lastRetrievedDate = new Date();

// Function to compare dates
const isCloserToDate = (date1, date2) => {
  const parsedDate1 = new Date(date1);
  const parsedDate2 = new Date(date2);

// Calculate the difference in milliseconds
const diff1 = Math.abs(parsedDate1 - lastRetrievedDate);
const diff2 = Math.abs(parsedDate2 - lastRetrievedDate);

return diff1 < diff2;
};

// Function to show a popup for new incidents
const showNewIncidentPopup = (date, location) => {
alert(`New incidents reported on ${date} at ${location}`);
};

// Function to update the last retrieved date
const updateLastRetrievedDate = (date) => {
lastRetrievedDate = new Date(date);
};

// Construct the API URL with the app token and any additional parameters
const apiUrl = `https://data.princegeorgescountymd.gov/resource/xjru-idbe.json?$limit=50&$$app_token=${appToken}`;

// Make the API call using jQuery
$.ajax({
url: apiUrl,
type: "GET",
dataType: "json",
})
.done(function (data) {
  console.log(`Retrieved ${data.length} records from the dataset!`);

  // List to hold ten objects
  const tenObjects = [];

  // Loop through the data
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    // If the list is not full, add the entry
    if (tenObjects.length < 10) {
      tenObjects.push({
        incident_case_id: entry.incident_case_id,
        street_address: entry.street_address,
        date: entry.date,
        location: entry.location,
        clearance_code_inc_type: entry.clearance_code_inc_type,
      });
    } else {
      // Check if the new entry is closer to the current date
      const closestEntry = tenObjects.find((obj) =>
        isCloserToDate(entry.date, obj.date)
      );
      // If it is closer, replace the existing entry
      if (closestEntry) {
        closestEntry.incident_case_id = entry.incident_case_id;
        closestEntry.street_address = entry.street_address;
        closestEntry.date = entry.date;
        closestEntry.location = entry.location;
        closestEntry.clearance_code_inc_type =
          entry.clearance_code_inc_type;
      }
    }
  }

  // Add data to the table
  tenObjects.forEach((entry) => {
    // Convert date string to Date object
    const dateFromString = new Date(entry.date);
    $("#data-table-body").append(`
    <tr>
      <td>${entry.incident_case_id}</td>
      <td>${entry.street_address}</td>
      <td>${dateFromString.toDateString()}</td>
      <td>${entry.location}</td>
      <td>${entry.clearance_code_inc_type}</td>
    </tr>
  `);
  });

  // Check if there are new incidents
  const newIncidents = data.filter(
    (entry) => new Date(entry.date) > lastRetrievedDate
  );

  if (newIncidents.length > 0) {
    // Show a popup for new incidents
    newIncidents.forEach((incident) => {
      showNewIncidentPopup(incident.date, incident.location);
    });
    // Update the last retrieved date
    updateLastRetrievedDate(newIncidents[0].date);
  }
  // Now the 'tenObjects' array contains the closest entries to the current date.
  console.log("Ten closest objects:", tenObjects);
})
.fail(function (jqXHR, textStatus, errorThrown) {
  console.error(`Error: ${textStatus}, ${errorThrown}`);
});
