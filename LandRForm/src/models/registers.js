const mongoose =require ("mongoose");
const userSchema =new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique:true
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    confirmPassword:{
        type: String,
        required: true
    },
    birthdate:{
        type: Date,
        required: true
    },
    country:{
        type: String,
        required: true
    }

})

const Register= new mongoose.model("Register",userSchema);
module.exports=Register;