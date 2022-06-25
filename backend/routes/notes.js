const express=require('express');
const router=express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note=require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE :1 Get all Notes  using : GET "/api/notes/fetchallnotes".  login required
router.get('/fetchallnotes', fetchuser,async (req,res)=>{
    try {
        const notes = await Note.find({user:req.user.id});
         res.json(notes)
    } catch(error){
        console.log(error.message);
        res.status(500).send("some error occured");
     }
   
})

// ROUTE :2 Add New Note  using : POST "/api/notes/addnote".  login required
router.post('/addnote', fetchuser,[
   body('title','Enter valid title').isLength({ min: 3 }),
   body('description','passworcescription must be atleast 5 character').isLength({ min: 5 }),],async (req,res)=>{
try {
    
 const {title,description,tag}=req.body;
    //if there are error return bad request and the error 
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
    const note= new Note({
        title,description,tag,user:req.user.id
    })
    const savedNote= await note.save()
    res.json(savedNote)
} catch(error){
    console.log(error.message);
    res.status(500).send("some error occured");
 }
})

 // ROUTE :3 Update an existing note  using : PUT "/api/notes/updatenote".  login required
   
 router.put('/updatenote/:id', fetchuser,async (req,res)=>{
const {title,description,tag}=req.body;
try {
    

//create a new note object
const newNote ={};
if(title){newNote.title=title};
if(description){newNote.description=description};
if(tag){newNote.tag=tag};

//find the note to be updated and update it
var note = await Note.findById(req.params.id);
if(!note){res.status(404).send("not found")}
if(note.user.toString()!==req.user.id){
    return res.status(401).send("not allowed"); 
}
note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
res.json({note});
} catch(error){
    console.log(error.message);
    res.status(500).send("some error occured");
 }
})



// ROUTE :4 Deleting an existing note  using : DELETE "/api/notes/deletenote".  login required
   
router.delete('/deletenote/:id', fetchuser,async (req,res)=>{
    const {title,description,tag}=req.body;
    
    try {
        
    
    //find the note to be deleted and delete it
    var note = await Note.findById(req.params.id);
    if(!note){res.status(404).send("not found")}

    //Allow deletion only if user owns this note
    if(note.user.toString()!==req.user.id){
        return res.status(401).send("not allowed"); 
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Sucess":"Note has been deleted",note:note});
} catch(error){
    console.log(error.message);
    res.status(500).send("some error occured");
 }
    })

module.exports=router