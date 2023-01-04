var file = require("fs");

function fridgeData() {
  let filePath = "public/js/comm-fridge-data.json";
  if(file.existsSync(filePath)){
    let data = file.readFileSync(filePath);
    data = JSON.parse(data);
    return data;
  }
  return undefined;
}


function itemsData(){
  let filePath = "public/js/comm-fridge-items.json";
  if(file.existsSync(filePath)){
    let data = file.readFileSync(filePath);
    data = JSON.parse(data);
    return data;
  }
}


function saveFridgeData(data){
  file.writeFile("public/js/comm-fridge-data.json", JSON.stringify(data), function(writeError){
    if(writeError){
      console.log("There has been an error writing to the comm-fridge-data.json file");
      throw err;
    }
  });

}


exports.allFridges = function(){
  let data = fridgeData();
  return data;

}

exports.addFridge = function(newFridge){
  let data = fridgeData();

  if('name' in newFridge && "can_accept_items" in newFridge && "accepted_types" in newFridge &&
      "contact_person" in newFridge && "contact_phone" in newFridge && "address" in newFridge && Object.keys(newFridge).length == 6){

        if("street" in newFridge.address && "postal_code" in newFridge.address && "city" in newFridge.address && "province" in newFridge.address && Object.keys(newFridge.address).length ==4 ){

          let uniqueID = ( Math.floor(Math.random() * 1000) ) * ( Math.floor(Math.random() * 1000) ) + "";
          let same = false;

          while(true){

            for(let f of data){
              if(f.id == uniqueID){
                uniqueID = ( Math.floor(Math.random() * 1000) ) * ( Math.floor(Math.random() * 1000) ) + "";
                same = true;
                break;
              }else{
                same = false;
              }
            }

            if(same == false){
              break;
            }

          }

          newFridge.id = uniqueID;
          newFridge.num_items_accepted = 0;
          newFridge.address.country = "Canada";
          newFridge.items = [];

          data.push(newFridge);
          saveFridgeData(data);

          return newFridge;

        }else{
          return undefined;
        }

      }else{
        return undefined;
      }

}

exports.getFridge = function(fridgeID){
  let data = fridgeData();
  exists = false;
  let result = "";
  for(let f of data){
    if(f.id == fridgeID){
      result = f;
      exists = true;
      break;
    }
  }

  if(exists == true){
    return result;
  }else{
    return undefined;
  }

}

exports.updateFridge = function(fridgeID, updateObj){
  let data = fridgeData();
  fridgeExists = false;
  fridge = "";

  for(let f of data){
    if(f.id == fridgeID){
      fridgeExists = true;
      fridge = f;
      break;
    }
  }

  if(fridgeExists == false){
    return undefined;
  }

  for(const prop in updateObj){
    if(prop == 'street' || prop == 'postal_code' || prop == 'city' || prop == 'province' ){
      continue;
    }else if (!(prop in fridge)  ) {
      return "fieldnotvalid";
    }
  }

  for(const prop in updateObj){
  
      if(prop == 'address'){
        for(const p in updateObj[prop]){
          fridge[prop][p] = updateObj[prop][p];
        }
      }else if (prop == 'street' || prop == 'postal_code' || prop == 'city' || prop == 'province') {
        fridge.address[prop] = updateObj[prop];
        console.log("done!");
      }else{
        fridge[prop] = updateObj[prop];
      }


  }

  saveFridgeData(data);
  return fridge;
}

exports.newItem = function(fridgeID, newItem){
  let data = fridgeData();
  let items = itemsData();

  let fridgeExists = false;
  let itemExists = false;
  let fridge = "";

  for(let f of data){
    if(f.id == fridgeID){
      fridgeExists = true;
      fridge = f;
      break;
    }
  }

  for(let i in items){
    if(items[i].id == newItem.id){
      itemExists = true;
      break;
    }
  }

  if(itemExists == false || fridgeExists == false){
    return undefined;
  }

  let currInFridge = false;
  for(let p of fridge.items){
    if(p.id == newItem.id){
      currInFridge = true;
      break;
    }
  }

  if(currInFridge == false){
    fridge.items.push(newItem);
  }else{
    return "inFridgeAlready";
  }

  saveFridgeData(data);

  return newItem;
}

exports.deleteItem = function(fridgeID, itemID){
  let data = fridgeData();
  let items = itemsData();

  let fridgeExists = false;
  let itemExists = false;
  let currInFridge = false;
  let fridge = "";

  for(let f of data){
    if(f.id == fridgeID){
      fridgeExists = true;
      fridge = f;
      break;
    }
  }

  for(let i in items){
    if(items[i].id == itemID){
      itemExists = true;
      break;
    }
  }

  if(fridgeExists){
    for(let p of fridge.items){
      if(p.id == itemID){
        currInFridge = true;
        break;
      }
    }
  }

  if(itemExists == false || fridgeExists == false || currInFridge == false){
    return undefined;
  }

  for(let c =0; c<fridge.items.length; c++){
    if(fridge.items[c].id == itemID){
      fridge.items.splice(c,1);
    }
  }

  saveFridgeData(data);

  return "success";

}

exports.deleteMultipleItems = function(fridgeID, query){
  let data = fridgeData();
  let items = itemsData();

  let fridgeExists = false;
  let itemExists = [];
  let queryItemsExist = false;
  let currInFridge = false;
  let fridge = "";


  for(let f of data){
    if(f.id == fridgeID){
      fridgeExists = true;
      fridge = f;
      break;
    }
  }

  for(let i in items){
    for(let c in query){
      if(items[i].id == c){
        itemExists.push(true);
        break;
      }
    }
  }

  if(itemExists.length == Object.keys(query).length){
    queryItemsExist = true;
  }

  itemExists = [];

  if(fridgeExists){
    for(let p of fridge.items){
      for(let c in query){
        if(p.id == c){
          itemExists.push(true);
          break;
        }
      }

    }
  }

  if(queryItemsExist == false || itemExists.length != Object.keys(query).length || fridgeExists == false){
    return undefined;
  }

  for(let q of Object.keys(query)){
    for(let a of fridge.items){
      if(a.id == q){
        let index = fridge.items.indexOf(a);
        fridge.items.splice(index,1);
      }
    }
  }

  saveFridgeData(data);

  return "success";

}

exports.deleteAllItems = function(fridgeID){
  let data = fridgeData();

  let fridgeExists = false;
  let fridge = "";

  for(let f of data){
    if(f.id == fridgeID){
      fridgeExists = true;
      fridge = f;
      break;
    }
  }

  if(fridgeExists == false){
    return undefined;
  }

  fridge.items = [];

  saveFridgeData(data);
  return "success";

}

exports.getItems = function(){
  let data = itemsData();
  return data;
}
