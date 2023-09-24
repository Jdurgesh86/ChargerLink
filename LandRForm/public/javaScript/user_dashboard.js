let nearbyBunks = [];


document.getElementById("searchForm").addEventListener("submit", function (event)
	{
			event.preventDefault();
			const latitude = document.getElementById("latitude").value;
			const longitude = document.getElementById("longitude").value;
			const searchDistance = document.getElementById("distance").value;
		// Make an AJAX request to the server
			fetch("/searchNearbyBunks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ latitude, longitude, searchDistance }),
			})
			.then((response) => response.json())
			.then((data) => {
			// Access the table element by its id
			// Handle the response data (list of nearby bunks) here
				nearbyBunks = data.nearbyBunks;
				const slotData = data.slotData;
				const bunkDistances = data.distances; 
			// Get a reference to the table element
				const table = document.getElementById("bunkTable");
			// Get a reference to the table body where rows will be appended
				const tbody = table.getElementsByTagName("tbody")[0];
			// Clear any existing rows in the table body
				tbody.innerHTML = "";
			// Loop through the nearby bunks and create a table row for each bunk
				nearbyBunks.forEach((bunk) => {
					const row = tbody.insertRow();
				// Create cells for bunk name, address, current slot capacity, and bunk distance
					const bunkNameCell = row.insertCell(0);
					const addressCell = row.insertCell(1);
					const currentSlotCapacityCell = row.insertCell(2);
					const bunkDistanceCell = row.insertCell(3); // Add a cell for bunk distance
				// Populate the cells with bunk data
					bunkNameCell.textContent = bunk.bunkName;
					addressCell.textContent = bunk.address;
					currentSlotCapacityCell.textContent = bunk.currentSlotCount;

				// Check if bunk distances are available for this bunk
					if (bunkDistances && bunkDistances[bunk.bunkName])
					{
						bunkDistanceCell.textContent = bunkDistances[bunk.bunkName] + " km";
					} else
						{
							bunkDistanceCell.textContent = "N/A"; // Display "N/A" if bunk distance is not available
						}
					globalMap(longitude,latitude,nearbyBunks);
				});

				// Update the UI to display the results
				function globalMap(userlongitude,userlatitude,nearbyBunks)
					{
						initMap(nearbyBunks);
						function initMap( nearbyBunks)
						{
							const mapOptions = {
								center: { lat: parseFloat(userlatitude), lng: parseFloat(userlongitude) },
								zoom: 12, // Initial zoom level
							};
							const map = new google.maps.Map(document.getElementById("map"), mapOptions);
						// Add a marker for the user's location
							const userLocationIcon = {
								url: 'https://cdn-icons-png.flaticon.com/128/8253/8253212.png', // custom marker icon image
								scaledSize: new google.maps.Size(40, 40), // Adjust the size of the marker icon as needed
							};
						// Create the user location marker with the custom icon
							const userLocationMarker = new google.maps.Marker({
								position: { lat: parseFloat(userlatitude), lng: parseFloat(userlongitude) },
								map: map,
								title: "User Location",
								icon: userLocationIcon, // Set the custom icon for the marker
							});

							// Add an info window to display user details when clicked
							const infowindow = new google.maps.InfoWindow({
								content: `<strong>Your location</strong>`,
							});
							userLocationMarker.addListener("click", () => {
								infowindow.open(map, userLocationMarker);
							});

						// Loop through nearby bunks and add markers for each bunk
							nearbyBunks.forEach((bunk) => {
								const bunkMarker = new google.maps.Marker({
									position: { lat: parseFloat(bunk.latitude), lng: parseFloat(bunk.longitude) },
									map: map,
									title: bunk.bunkName,
								});
							// Add an info window to display bunk details when clicked
								const infowindow = new google.maps.InfoWindow({
									content: `<strong>${bunk.bunkName}</strong><br>Address: ${bunk.address}<br>Current Slot Capacity: ${bunk.currentSlotCount}<br>bunk operator:${bunk.operator}`,
								});
								bunkMarker.addListener("click", () => {
									infowindow.open(map, bunkMarker);
								});
							});
						}
					}
				// Update the UI to display the populated table
			})
		.catch((error) => {
			console.error("Error fetching nearby bunks:", error);
		// Handle the error if needed
		});
	});




document.addEventListener("DOMContentLoaded", () => {
    	const fetchSlotDataBtn = document.getElementById("fetchSlotDataBtn");

    	fetchSlotDataBtn.addEventListener("click", () => {
        	fetch("/getSlotDataForNearbyBunks", {
            	method: "POST",
            	headers: {
                	"Content-Type": "application/json",
            	},

        	})
        	.then((response) => response.json())
        	.then((data) => {
            	const slotData = data.slotData;
            	displaySlotData(slotData);
        	})
        	.catch((error) => {
            	console.error("Error fetching slot data:", error);
       		});
    	});

   		function displaySlotData(slotData) {
  			const table = document.getElementById("slotTable");
  		// Get a reference to the table body where rows will be appended
  			const tbody = table.getElementsByTagName("tbody")[0];
  		// Clear any existing rows in the table body
  			tbody.innerHTML = "";
  		// Loop through the slot data and add rows to the table for slot details
  			nearbyBunks.forEach((bunk) => {
  				const row = tbody.insertRow();
  				const bunkNameCell = row.insertCell(0);
  				const slotNameCell = row.insertCell(1);
  				const chargingPowerCell = row.insertCell(2);
  				const statusCell = row.insertCell(3);

				bunkNameCell.textContent = bunk.bunkName;
				slotNameCell.textContent = ''; // Leave this cell empty for bunks
  				chargingPowerCell.textContent = bunk.chargingPower;
  				statusCell.textContent = bunk.status;

				if(bunk.currentSlotCount>0){
    				slotData.forEach((slot) => {
   					// Create a row for the slot
    					if(bunk._id===slot.bunk)
  						{
    						const row = tbody.insertRow();
    					// Create cells for bunk name, slot name, charging power, and status
    						const bunkNameCell = row.insertCell(0);
    						const slotNameCell = row.insertCell(1);
    						const chargingPowerCell = row.insertCell(2);
    						const statusCell = row.insertCell(3);

    					// Populate the cells with data
    						bunkNameCell.textContent = slot.bunkName;
    						slotNameCell.textContent = slot.slotName;
    						chargingPowerCell.textContent = slot.chargingPower;
    						statusCell.textContent = slot.status;
    					}
 					 });
  				}else
					{
    					bunkNameCell.textContent = bunk.bunkName;
    					slotNameCell.textContent = 'N/A';
    					chargingPowerCell.textContent = 'N/A';
    					statusCell.textContent = 'N/A';
  					}
			});
		}
	});

