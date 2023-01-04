const express = require("express");
const path = require('path');
let fridgeRouter = express.Router();
const app = express();
const file = require("fs");

const a3functions = require("./a3FunctionModule.js");
app.use(express.json());

fridgeRouter.get("/", function(req, res, next){
  let p = path.join(__dirname, 'public/view_pickup.html');

  if(req.accepts('html')){
    if(file.existsSync(p)){
      res.status(200);
      res.sendFile(path.join(__dirname, 'public/view_pickup.html'));
    }else if(!file.existsSync(p)){
      res.status(404).send();
    }else{
      res.status(500).send("Some other error has occured.");
    }

  }else if(req.accepts('json')){
    let data = a3functions.allFridges();
    if(data){
      res.status(200).set("Content-Type","application/json").json(data);
    }else if(!data){
      res.status(404).send("The file is not found.");
    }else{
      res.status(500).send("Some other error has occured.");
    }

  }

});

fridgeRouter.get("/addFridge", function(req,res,next){
  let p = path.join(__dirname, 'public/addFridge.html');
  if(req.accepts('html')){
    if(file.existsSync(p)){
      res.status(200);
      res.sendFile(path.join(__dirname, 'public/addFridge.html'));
      //console.log("hello I am from /fridges in router.js!");
    }else if(!file.existsSync(p)){
      //console.log("file not here");
      res.status(404).send();
    }else{
      res.status(500).send("Some other error has occured.");
    }

  }

});

fridgeRouter.post("/", express.json(), function(req,res,next){
  let data = req.body;
  let result = a3functions.addFridge(data);

  if(result){
    res.status(200).set("Content-Type","application/json").json(result);
  }else if(!result){
    res.status(400).send("Error from client, missing or incorrect fields in POST body.");
  }else{
    res.status(500).send("Some other error has occured.");
  }

});

fridgeRouter.get("/editFridge", function(req,res,next){
  let p = path.join(__dirname, 'public/editFridge.html');
  if(req.accepts('html')){
    if(file.existsSync(p)){
      res.status(200);
      res.sendFile(path.join(__dirname, 'public/editFridge.html'));
    }else if(!file.existsSync(p)){
      //console.log("file not here");
      res.status(404).send();
    }else{
      res.status(500).send("Some other error has occured.");
    }
  }else{
    res.status(500).send("Some other error has occured.");
  }
});


fridgeRouter.get("/:fridgeID", function(req,res,next){

  if(req.accepts('json')){
    let fridgeID = req.params.fridgeID;
    let result = a3functions.getFridge(fridgeID);

    if(result){
      res.status(200).set("Content-Type","application/json").json(result);
    }else if(!result){
      res.status(404).send();
    }else{
      res.status(500).send();
    }
  }else{
    res.status(400).send();
  }

});

fridgeRouter.put("/:fridgeID", express.json(), function(req,res,next){
  let fridgeID = req.params.fridgeID;
  let result = a3functions.updateFridge(fridgeID, req.body);
  //console.log(result);

  if(result == "fieldnotvalid"){
    res.status(400).send("Incorrect data in body of PUT request");
  }else if(result){
    res.status(200).set("Content-Type","application/json").json(result);
  }else if(!result){
    res.status(404).send("fridgeID does not exist.");
  }else{
    res.status(500).send();
  }

});

fridgeRouter.post("/:fridgeID/items", express.json(), function(req,res,next){
  let fridgeID = req.params.fridgeID;
  let newItem = req.body;
  let result = a3functions.newItem(fridgeID, newItem);

  if(!('id' in req.body) || !('quantity' in req.body) || Object.keys(req.body).length > 2 || result == "inFridgeAlready"){
    res.status(400).send("Data within POST not formatted properly/some other error occured.");
  }

  if(result){
    res.status(200).set("Content-Type","application/json").json(result);
  }else{
    res.status(404).send("fridgeID or itemID do not exist.");
  }

});

fridgeRouter.delete("/:fridgeID/items", express.json(), function(req,res,next){
  let query = req.query;
  //console.log(Object.keys(query).length);
  let fridgeID = req.params.fridgeID;
  let result = "";

  if(Object.keys(query).length > 0){
    result = a3functions.deleteMultipleItems(fridgeID,query);
  }else{
    result = a3functions.deleteAllItems(fridgeID);
  }

  if(result){
    res.status(200).send();
  }else if(!result){
    res.status(404).send("fridgeID or itemID does not exist.");
  }else{
    res.status(500).send("Some other error has occured.");
  }

});


fridgeRouter.delete("/:fridgeID/:itemID", express.json(), function(req,res,next){
  let fridgeID = req.params.fridgeID;
  let itemID = req.params.itemID;
  let result = a3functions.deleteItem(fridgeID, itemID);

  if(result){
    res.status(200).send();
  }else if(!result){
    res.status(404).send("fridgeID or itemID does not exist.");
  }else{
    res.status(500).send("Some other error occured");
  }

});






module.exports = fridgeRouter;
