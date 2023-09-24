//get the data of bunk details from the database for manage existiong ev bunk details
fetch('/getBunks')                                      
    .then(response => response.json())              //result.json data receive here
    .then(data =>{
        const dataTable = document.getElementById('data-table');
        data.forEach(item =>
            {
                const row = document.createElement('tr');
                row.dataset.rowId = item._id;                // Set the data-row-id attribute
                row.innerHTML = `
                    <td>${item.bunkName}</td>
                    <td>${item.address}</td>
                    <td>${item.slotCapacity}</td>
                    <td>${item.chargingPower}</td>
                    <td>${item.operator}</td>
                    <td>${item.status}</td>
                    <td><button onclick="openPopup('${item._id}')">Edit</button></td>           
                `;  //opens the edit bunk details window
                dataTable.appendChild(row);
            });
    })
    .catch(error =>{
        console.error('Error fetching data:', error);
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to handle the edit button click of manage existing bunk details 
function openPopup(rowId)
    {
    // Get the row element using the rowId
        const row = document.querySelector(`tr[data-row-id="${rowId}"]`);
    
        // Get data from the selected row
        const bunkId = rowId;
        const bunkName = row.cells[0].textContent;
        const address = row.cells[1].textContent;
        const availableSlots = row.cells[2].textContent;
        const chargingPower = row.cells[3].textContent;
        const operator = row.cells[4].textContent;
        const status = row.cells[5].textContent;
    
    // Populate the popup input fields with row data
        document.getElementById('popupBunkId').value = bunkId;
        document.getElementById('popupBunkName').value = bunkName;
        document.getElementById('popupAddress').value = address;
        document.getElementById('popupAvailableSlots').value = availableSlots;
        document.getElementById('popupChargingPower').value = chargingPower;
        document.getElementById('popupOperator').value = operator;
        document.getElementById('popupStatus').value = status;
    // Show the popup
        const popup = document.getElementById("editPopup");
        popup.style.display = "block";
    }


// Function to close the popup
function closePopup()
    {
    // Close the popup
        const popup = document.getElementById("editPopup");
        popup.style.display = "none";
    }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to fetch and populate the bunk options for manage recharge slot for ev bunk
function populateBunkOptions()
    {
    // Fetch the list of bunks from your database
        fetch('/getBunks') 
            .then(response => response.json())
            .then(data =>{
                const bunkSelect = document.getElementById("bunkSelect");
            // Clear any existing options
                bunkSelect.innerHTML = '';
            // Add the default "Select Bunk" option as the first option
                const defaultOption = document.createElement("option");
                defaultOption.value = ''; // set this to an empty string or another value as needed
                defaultOption.textContent = 'Select Bunk';
                bunkSelect.appendChild(defaultOption);
            // Populate the select element with retrieved bunks
                data.forEach(bunk =>{
                    const option = document.createElement("option");
                    option.value = bunk._id; // Use the appropriate ID or value from your database
                    option.textContent = bunk.bunkName; // Use the appropriate field for bunk name
                    bunkSelect.appendChild(option);
                });
            })
            .catch(error =>{
                console.error('Error fetching bunks:', error);
            });
    }


// Call the function to populate bunk options when the page loads
populateBunkOptions();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//in this section display that recharge slots with the selected bunk id for existing recharge slot
document.getElementById('bunkSelect').addEventListener('change', function ()
    {
        const selectedBunkId = this.value;
    // Set the selected bunk's ID in the hidden input field
        document.getElementById('selectedBunk').value = selectedBunkId;
    });


// Function to handle bunk selection
function handleBunkSelection()
    {
        const bunkSelect = document.getElementById('bunkSelect');
        const selectedBunkIdInput = document.getElementById('selectedBunkId');
        const rechargeSlotList = document.getElementById('rechargeSlotList');

    // Function to fetch and display existing recharge slots for the selected bunk
    // Initialize a variable to store the selected bunk ID
        let selectedBunkId = null;

    // Function to display recharge slots for the selected bunk
        function displayRechargeSlots(bunkId)
            {
            // Fetch the list of recharge slots based on the selected bunk
                fetch(`/getSlots?bunkId=${bunkId}`)
                    .then(response => response.json())
                    .then(data =>{
                    // Clear the existing slots
                        rechargeSlotList.innerHTML = '';
                        data.forEach(slot =>{
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${slot.slotName}</td>
                                <td>${slot.chargingPower}</td>
                                <td>${slot.status}</td>
                                <td><button onclick="openPopupSlots('${slot._id}')">Edit</button></td>
                            `;
                            rechargeSlotList.appendChild(row);
                        });
                    })
                    .catch(error =>{
                        console.error('Error fetching recharge slots:', error);
                    });
            }


            // Event listener to trigger when the bunk selection changes
            bunkSelect.addEventListener('change', function ()
                {
                    const newSelectedBunkId = this.value;
                    // Check if the selected bunk has changed
                    if (newSelectedBunkId !== selectedBunkId)
                    {
                    // Update the selected bunk ID
                        selectedBunkId = newSelectedBunkId;
                    // Display recharge slots for the selected bunk
                        displayRechargeSlots(selectedBunkId);
                    }
                });

            // Initial display based on the initially selected bunk
            const initialSelectedBunkId = bunkSelect.value;
            selectedBunkIdInput.value = initialSelectedBunkId;
            displayRechargeSlots(initialSelectedBunkId);
    }


// Call the function to set up bunk selection handling
handleBunkSelection();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to open the recharge slot edit popup
function openPopupSlots(slotId)
    {
        const SlotId=slotId;
    // Step 1: Fetch the recharge slot details from the backend
        fetch(`/getRechargeSlotDetails?slotId=${slotId}`)
            .then(response => response.json())
            .then(data =>{
            // Step 2: Populate the popup form fields with slot details
                document.getElementById('editSlotId').value = SlotId;
                document.getElementById('editSlotName').value = data.slotName;
                document.getElementById('editChargingPower').value = data.chargingPower;
                document.getElementById('editStatus').value = data.status;
            // Step 3: Display the popup by setting its display style to "block"
                const popup = document.getElementById('editRechargeSlotPopup');
                popup.style.display = 'block';
            })
            .catch(error =>{
                    console.error('Error fetching slot details:', error);
            });
    }


    // Function to close the edit recharge slot popup
function closeEditPopup()
    {
        const editPopup = document.getElementById('editRechargeSlotPopup');
        editPopup.style.display = 'none';
    }


