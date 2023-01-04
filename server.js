const express = require("express");
const app = express();
const a3functions = require("./a3FunctionModule.js");
const path = require('path');
const fridgeRouter = require("./router.js");
const file = require("fs");

app.use("/fridges", fridgeRouter);

//To get items from comm-fridge-items.json for application logic
app.get("/items", function(req,res,next){
  if(req.accepts('json')){
    let result = a3functions.getItems();
    if(result){
      res.status(200).set("Content-Type","application/json").json(result);
    }else if(!result){
      res.status(404).send();
    }else{
      res.status(500).send();
    }
  }
});

app.get("/", function(req,res,next){
  let p = path.join(__dirname, 'public/index.html');

  if(file.existsSync(p)){
    res.status(200);
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }else if(!file.existsSync(p)){
    res.status(404).send();
  }else{
    res.status(500).send("Some other error has occured.");
  }

});

app.get("/index.html", function(req,res,next){
  let p = path.join(__dirname, 'public/index.html');

  if(file.existsSync(p)){
    res.status(200);
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }else if(!file.existsSync(p)){
    res.status(404).send();
  }else{
    res.status(500).send("Some other error has occured.");
  }

});

app.use(express.static("public"));
app.listen(8000);
console.log("Server is running!");
