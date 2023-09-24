const express= require("express");
const app= express();
const path = require("path")
const hbs =require("hbs");

require("./db/conn");

const Register=require("./models/registers");
const AdminRegister = require("./models/adminRegisters"); // Import the AdminRegister model
const CreateBunk =require("./models/BunkForm");
const RechargeSlot = require('./models/rechargeSlot'); // Import your recharge slot model
const Bunk = require("./models/BunkForm");
const { json } = require("express");
const { error } = require("console");

const port = process.env.PORT || 3000;

const static_path =path.join(__dirname, "../public");
const template_path=path.join(__dirname,"../templates/views");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));

app.set("view engine","hbs");
app.set("views",template_path);

app.get("/",(req,res)=>{
    res.render("index")
});

app.get("/user_registration",(req,res)=>{
    res.render("user_registration")
})

app.get("/user_login",(req,res)=>
{
    res.render("user_login")
})

app.get("/admin_registration", (req, res) => {
    res.render("admin_registration");
});

app.get("/admin_login", (req, res) => {
    res.render("admin_login");
});




//user registration form get filled in database from here
app.post("/UserRegistration",async(req,res)=>{
    try{
            const password=req.body.password;
            const cpassword=req.body.confirmPassword;
            if(password.length>=8)
                {
                    if(password === cpassword)
                        {   
                            const inputUsername=req.body.username;
                            const alreadyUser = await Register.findOne({ username: { $regex: new RegExp(inputUsername, 'i') } });
                            if(!alreadyUser)
                            {
                                const registeruser=new Register({
                                    username: req.body.username,
                                    email:req.body.email,
                                    password:password,
                                    confirmPassword:cpassword,
                                    birthdate:req.body.birthdate,
                                    country:req.body.country
                                })
                                const registerd=await registeruser.save();
                                res.status(201).render("index");
                            }else
                                {
                                    res.send("you are already a user");
                                }
                        }else
                            {
                                res.send("password not match")
                            }
                    }else{
                            res.send("password must 8 character long")
                        }
        } catch(error)
            {
                res.status(400).send(error);
            }
    });




//hadles user login
app.post("/UserLogin",async(req,res)=>{
        try{
                const inputUsername=req.body.loginUsername;
                const inputPassword=req.body.loginPassword;
                const isUser = await Register.findOne({ username: { $regex: new RegExp(inputUsername, 'i') } });

                if(isUser.password===inputPassword)
                    {
                        res.status(201).render("user_dashboard");
                    }else
                        {
                            res.send("wrong credentials");
                        }
            }catch(error)
                {
                    res.status(400).send("wrong credentials")
                }
    })





// Admin Registration 
app.post("/adminRegistration", async (req, res) => {
    try {
        // Extract fields from req.body for admin registration
            const { username, email, password, confirmPassword, fullName, company } = req.body;

        // Check password match and other validation
            if (password === confirmPassword && password.length >= 8)
                {
                // Create a new admin document
                    const adminRegister = new AdminRegister({
                        username,
                        email,
                        password,
                        confirmPassword,
                        fullName,
                        company
                    });
                // Save the admin document to the database
                    const adminRegistered = await adminRegister.save();
                    res.status(201).render("index");
                } else
                    {
                        res.send("Invalid registration data. Please check your inputs.");
                    }
        } catch (error)
            {
                res.status(400).send(error);
            }
});




//admin login
app.post("/Adminlogin",async(req,res)=>{
    try{
            const adminLoginUsername=req.body.adminloginusername;
            const adminLoginPassword =req.body.adminloginpassword;
            const admin = await AdminRegister.findOne({ username: { $regex: new RegExp(adminLoginUsername, 'i') } });
            if(admin.password===adminLoginPassword)
                {
                    res.status(201).render("admin_dashboard");
                }else
                    {
                        res.send("wrong credentials");
                    }
        }catch(error)
            {
                res.status(400).send("invalid Username");
            }
    })




app.post("/createBunkForm", async(req, res) => {
        try {
            // Extract fields from req.body for admin registration
                const { bunkName,address,mobile,latitude,longitude,slotCapacity,chargingPower,operator,status} = req.body;
            // Same name in both form as well as schema so no need to use ':'
                const BunkForms = new CreateBunk({
                        bunkName,address,mobile,latitude,longitude,slotCapacity,chargingPower,operator,status
                    });
            // Save the admin document to the database
                const bunkCreated = await BunkForms.save();
                res.status(201).render("admin_dashboard");
            }catch (error)
                {
                    res.status(400).send("Something went wrong!!! Please Refresh and clear the data");
                }
    });




app.post("/editForm", async (req, res) => {
        try {
            // Extract fields from req.body for admin registration
                const {
                        bunkId,
                        bunkName,
                        address,
                        availableSlots,
                        chargingPower,
                        operator,
                        status,
                    // Access the rowId from req.body
                    } = req.body;

                try{
                        const result =await CreateBunk.updateOne({_id:bunkId},{
                            $set:{
                                    bunkName:bunkName,
                                    address:address,
                                    slotCapacity:availableSlots,
                                    chargingPower:chargingPower,
                                    operator:operator,
                                    status:status
                                }
                            });
                        console.log(result);
                    }catch(err)
                        {
                            console.log(err);
                        }
                res.status(201).render("admin_dashboard");
            } catch (error)
                {
                    res.status(400).send(error);
                }
    });




app.post("/addRechargeSlot", async (req, res) => {
        try {
            // Extract fields from req.body for recharge slot creation
                const { bunk,slotName, chargingPower, status  } = req.body;
            // Fetch the bunk's slot capacity from the database based on the provided bunkId
                const bunk1 = await CreateBunk.findById(bunk);
                if (!bunk1)
                    {
                        return res.status(404).send("Bunk not found");
                    }
            // Calculate the total charging power of all existing slots for the selected bunk
                const existingSlots = await RechargeSlot.find({ bunk });
                const totalChargingPower = existingSlots.reduce((total, slot) => total + slot.chargingPower, 0);
            // Calculate the total charging power including the new slot
                const chargingPowerNumber = parseFloat(chargingPower);
                const totalNewChargingPower = totalChargingPower + chargingPowerNumber;
            // Check if the total charging power including the new slot exceeds the bunk's slot capacity
                if (bunk1.currentSlotCount < bunk1.slotCapacity)
                    {
                        if(totalNewChargingPower<=bunk1.chargingPower)
                            {
                                const slotDetail = new RechargeSlot({
                                        slotName,
                                        chargingPower,
                                        status,
                                        bunk,
                                    });
                            // Save the recharge slot document to the database
                                await slotDetail.save();
                            }else
                                {
                                    res.status(400).send("total charging power exceeds the total bunk charging power");
                                }
                    // Increment the current slot count for the selected bunk
                        bunk1.currentSlotCount += 1;
                        await bunk1.save();
                        res.status(201).send("Recharge slot added successfully");
                    } else
                        {
                            res.status(400).send("Number of slots exceeds bunk capacity.");
                        }
            } catch (error)
                {
                    //console.error(error);
                    //res.status(500).send(error);
                }
    });




app.post("/editSlot", async (req, res) => {
        try {
                const {
                        SlotId,
                        editSlotName,
                        editChargingPower,
                        editStatus,
                    } = req.body;
            // Fetch the existing recharge slot and its associated bunk
                const existingSlot = await RechargeSlot.findById(SlotId);
                if (!existingSlot)
                    {
                        return res.status(404).send("Recharge slot not found");
                    }
            // Fetch the associated bunk's details
                const isBunk = await CreateBunk.findById(existingSlot.bunk);
                if (!isBunk)
                    {
                        return res.status(404).send("Bunk not found");
                    }
                const existingSlots = await RechargeSlot.find({ bunk: existingSlot.bunk, _id: { $ne: SlotId } });
            // excluding the charging power of the slot being edited
                const totalChargingPower = existingSlots.reduce((total, slot) => total + parseFloat(slot.chargingPower), 0);
            // Calculate the total charging power including the edited slot
                const editedChargingPowerNumber = parseFloat(editChargingPower);
                const totalNewChargingPower = totalChargingPower + editedChargingPowerNumber;
            // Check if the total charging power including the edited slot exceeds the bunk's total charging power
                if (totalNewChargingPower <= isBunk.chargingPower)
                    {
                    // Update the recharge slot details
                        await RechargeSlot.updateOne({ _id: SlotId }, {
                                slotName: editSlotName,
                                chargingPower: editedChargingPowerNumber,
                                status: editStatus,
                            });
                        return res.status(201).send("Recharge slot updated successfully");
                    } else
                        {
                            return res.status(400).send("Total charging power exceeds the total bunk charging power.");
                        }
             } catch (error)
                {
                    console.error(error);
                    return res.status(500).send(error);
                }
    });




//global variable
let nearbyBunkNames = [];
// Define a function to search for bunks within a specified distance
app.post("/searchNearbyBunks", async (req, res) => {
        const { latitude, longitude, searchDistance } = req.body;
        try {
            // Query all bunks from the database
                const bunkData = await Bunk.find({}, { bunkName: 1, latitude: 1, longitude: 1, address: 1, currentSlotCount: 1, operator: 1, _id: 1 });
                const nearbyBunks = searchBunks(
                        parseFloat(latitude),
                        parseFloat(longitude),
                        parseFloat(searchDistance),
                        bunkData,
                    );
                nearbyBunkNames = nearbyBunks.map((bunk) => bunk.bunkName);
                const distances = {};
                async function findBunkIds()
                    {
                        for (const bunkName of nearbyBunkNames)
                            {
                                try {
                                        const bunk = await Bunk.findOne({ bunkName }, '_id');
                                        if (bunk)
                                            {
                                                const bunkId = bunk._id;
                                                const slotData = await RechargeSlot.find({ bunk: bunkId }, { slotName: 1, chargingPower: 1, status: 1, _id: 0 });
                                            // Access the bunkDistance of the first nearby bunk 
                                            // Loop through all nearby bunks and access their bunkDistance values
                                                nearbyBunks.forEach((nearbyBunk) => {
                                                        nearbyBunk.bunkDistance = calculateDistance(
                                                                parseFloat(latitude),
                                                                parseFloat(longitude),
                                                                parseFloat(nearbyBunk.latitude),
                                                                parseFloat(nearbyBunk.longitude)
                                                            );
                                                        distances[nearbyBunk.bunkName] = nearbyBunk.bunkDistance;
                                                    });
                                                res.json({ nearbyBunks, slotData, distances });
                                            } else
                                                {
                                                    console.log(`Bunk not found for ${bunkName}`);
                                                }
                                    } catch (error)
                                        {
                                            console.error(`Error finding bunk for ${bunkName}: ${error.message}`);
                                        // Handle the error if needed
                                        }
                            }
                    // Return the nearby bunks as a JSON response after collecting all data
                    }
                findBunkIds();
                } catch (error)
                    {
                        console.error("Error fetching bunks:", error);
                        res.status(500).json({ error: "Internal Server Error" });
                    }
    });




function searchBunks(latitude, longitude, searchDistance, bunkData)
    {
        return bunkData.filter((bunk) => {
            // Calculate the distance between the user's coordinates and each bunk
                const bunkDistance = calculateDistance(
                        latitude,
                        longitude,
                        bunk.latitude,
                        bunk.longitude
                    );
            // Check if the bunk is within the search distance
                if (bunkDistance <= searchDistance)
                    {
                    // If the bunk is within the search distance
                        bunk.bunkDistance = bunkDistance; // Add bunkDistance to the object
                        return {
                                bunkName: bunk.name, 
                                latitude: bunk.latitude,
                                longitude: bunk.longitude,
                                address: bunk.address, 
                                currentSlotCapacity: bunk.currentSlotCount,
                                operator:bunk.operator, 
                            };
                    } else
                        {
                            return null; // Bunk is outside the search distance
                        }
            }).filter((bunk) => bunk !== null); // Filter out bunk objects that are null
    }




function calculateDistance(lat1, lon1, lat2, lon2)
    {
    // Convert latitude and longitude from degrees to radians
        const radLat1 = (Math.PI * lat1) / 180;
        const radLon1 = (Math.PI * lon1) / 180;
        const radLat2 = (Math.PI * lat2) / 180;
        const radLon2 = (Math.PI * lon2) / 180;
    // Earth's radius in kilometers
        const earthRadius = 6371; 
    // Haversine formula
        const dLat = radLat2 - radLat1;
        const dLon = radLon2 - radLon1;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Calculate the distance in kilometers
    // Calculate the distance in kilometers and round it to 3 decimal places
        const distance = (earthRadius * c).toFixed(3);
        return distance;
    }




app.post("/getSlotDataForNearbyBunks", async (req, res) => {
        try {
            // Query slots with the bunk reference populated
                const bunkIds = await Bunk.find({ bunkName: { $in: nearbyBunkNames } }, "_id");
                const slotData = await RechargeSlot.find({ bunk: { $in: bunkIds } })
                if (slotData.length === 0)
                    {
                        return res.status(404).json({ error: "No nearby slot data found" });
                    }
                res.json({ slotData });
            } catch (error)
                {
                    console.error("Error fetching slot data:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
    });




//this sends the bunk data to the admin dashboard for manage ev bunk details and populate bunk options
app.get('/getBunks', async (req, res) => {
        try {
                const data = await CreateBunk.find();
                res.json(data);
            } catch (error)
                {
                    console.error('Error fetching data:', error);
                    res.status(500).json({ error: 'Error fetching data' });
                }
    });




app.get('/getSlots', async (req, res) => {
        try {
                const { bunkId } = req.query; // Get the bunkId from the query parameters
                const data = await RechargeSlot.find({ bunk: bunkId}); // Filter by bunkId
                res.json(data);
            } catch (error)
                {
                    console.error('Error fetching data:', error);
                    res.status(500).json({ error: 'Error fetching data' });
                }
    });




app.get('/getRechargeSlotDetails', (req, res) => {
        const slotId = req.query.slotId; // Get the slotId from the query parameters
    // Replace this with your logic to fetch slot details from your database
    // Assuming you have a Mongoose model called RechargeSlot
        RechargeSlot.findById(slotId)
        .then(slot => {
                if (!slot)
                    {
                        return res.status(404).json({ error: 'Slot not found' });
                    }
            // Return the slot details as JSON
                res.json(slot);
            })
        .catch(error => {
                console.error('Error fetching slot details:', error);
                res.status(500).json({ error: 'Error fetching slot details' });
            });
    });




app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })


