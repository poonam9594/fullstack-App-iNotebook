const express=require('express');
const router=express.Router();
const User=require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'poonam$Deshmukh';


// ROUTE :1create a user using : POST "/api/auth/createuser". No login required
router.post('/createuser',[
   body('email','Enter Valid Email').isEmail(),
   body('name','Enter valid Name').isLength({ min: 3 }),
   body('password','password must be 5').isLength({ min: 5 }),
],async (req,res)=>{
   let sucess=false;
   //if there are error return bad request and the error 
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

//check whether the user with this email exist alredy

try{
let user= await User.findOne({email:req.body.email});
if (user){
   return res.status(400).json({error:"sorry a user with this email alredy exist"})
}
const salt= await bcrypt.genSalt(10);
  const  secPass= await bcrypt.hash(req.body.password,salt)
  //create a new user
   user= await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });
const data={
   user:{
      id:user.id
   }
}
const authtoken=jwt.sign(data,JWT_SECRET);
//res.json(user)
sucess=true;
console.log(authtoken)
  
   // res.json(user)
   res.json({sucess,authtoken})
} catch(error){
   console.log(error.message);
   res.status(500).send("some error occured");
}
    
})

// ROUTE :2 Authenticate a User using : POST "/api/auth/login". No login required
router.post('/login',[
   body('email','Enter Valid Email').isEmail(),
   body('password','Password can not blank').exists(),

],async (req,res)=>{
   let sucess=false;
   //if there is errors, return bad request and the errors

   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const {email,password}=req.body;
   try{
      let user = await User.findOne({email});
      if(!user){
         sucess=false;
         return res.status(400).json({sucess,error:"please try to login with correct credentials"});
      }
      const passwordcompare  = await bcrypt.compare(password,user.password);
      if(!passwordcompare){
         sucess=false;
         return res.status(400).json({sucess,error:"please try to login with correct credentials"});
      }

      const data={
         user:{
            id:user.id
         }
      }

const authtoken=jwt.sign(data,JWT_SECRET);
sucess=true;
res.json({sucess,authtoken});

   }catch(error){
      console.error(error.message);
      res.status(500).send("Internel Server Error");
   }





   // ROUTE :3 get logged in User details using : POST "/api/auth/getuser".  login required
   router.post('/getuser',fetchuser,async (req,res)=>{


   try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
      
   } catch(error){
      console.error(error.message);
      res.status(500).send("Internel Server Error");
   }
})

})
module.exports = router