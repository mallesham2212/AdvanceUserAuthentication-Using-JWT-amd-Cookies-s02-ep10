const validator=require("validator");
const validateSignUpData = (req)=>{
    const {firstName,lastName,passWord,Email}=req.body;
    if(!firstName  || !lastName){
        throw new Error("Name is not Valid");
    }
    else if(!validator.isEmail(Email)){
        throw new Error("Enter Valid Email");
        
    }
    else if(!validator.isStrongPassword(passWord)){
        throw new Error("Enter a Strong Password");
    }

}
module.exports={validateSignUpData};