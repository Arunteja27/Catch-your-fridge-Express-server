window.onload = function(){
	let pageId = document.getElementsByTagName("body")[0].id;
	if(pageId != null && pageId == "view_items"){
		requestFridgeList("http://localhost:8000/fridges" ,pageId);
		//displayFridges(pageId);
	}

}

function requestFridgeList(URL, pageId){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
			let data = xhttp.responseText;
			data = JSON.parse(data);
			if(pageId == "view_items"){
				displayFridges(data, pageId);
			}else{
				processCartCont(data, pageId);
			}

		}
	};
	xhttp.open("GET", URL, true);
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();
}



function displayFridges(fridges, pageId){
	let fridgesSection = document.getElementById("fridges");

//Add a fridge button
	let addFridgeButton = document.createElement('button');
	addFridgeButton.id = "addFridgeButton";
	addFridgeButton.innerHTML = "Add a fridge";
	addFridgeButton.addEventListener("click", function(){
		location.href = "/fridges/addFridge";
	});
	fridgesSection.appendChild(addFridgeButton);


	let header = document.createElement("h1");
	header.textContent = "Available fridges";
	fridgesSection.appendChild(header);

	for(let i = 0; i < fridges.length; i++){
		let fridgeData = document.createElement("div");
		fridgeData.id = "fridge_" + i;

		let fridgeContent = "<img src='images/fridge.svg'></span>";
		fridgeContent += "<span><strong>" + fridges[i].name + "</strong></span>";
		fridgeContent	+= "<span>" + fridges[i].address.street + "</span>";
		fridgeContent += "<span>" + fridges[i].contact_phone + "</span>"

		fridgeData.innerHTML = fridgeContent;
		fridgeData.addEventListener("click", function(event){
			let fridgeIndex = event.currentTarget.id.split("_")[1];
			let fridgeID = fridges[i].id;
			let URL = "http://localhost:8000/fridges/" + fridgeID;
			requestFridgeData(URL, parseInt(fridgeIndex));

			//displayFridgeContents(parseInt(fridgeID));
		});


		//Edit a fridge button for each fridge
		let editFridgeButton = document.createElement('button');
		editFridgeButton.className = 'editFridgeButton';
		editFridgeButton.id = fridges[i].id;
		editFridgeButton.innerHTML = "Edit this fridge";
		editFridgeButton.addEventListener("click", function(event){
			event.stopPropagation();
			let fridgeID = fridges[i].id;
			window.location.href = "/fridges/editFridge" + "?" + fridgeID;
		});
		fridgeData.appendChild(editFridgeButton);


		fridgesSection.appendChild(fridgeData);

	}


}

//Add fridge code
let submitNewFridgeBtn = document.getElementById("submitNewFridgeBtn");
if(typeof(submitNewFridgeBtn) != "undefined" && submitNewFridgeBtn != null){
	let typesSelect = document.getElementById("typesSelect");
	let ob = {};
	let URL = "http://localhost:8000/items";
	requestItemsList(URL, ob, -1);
	let types = [];

	function addNewFridge(data){
		for(prop in data){
			if( !(types.includes(data[prop].type)) ){
				types.push(data[prop].type);
			}
		}

		for(type of types){
			let option = document.createElement('option');
			option.value = type;
			option.innerHTML = type;
			typesSelect.appendChild(option);
		}

		submitNewFridgeBtn.addEventListener("click", validateFridge);
	}

	function validateFridge(){
		let fridgeName = document.getElementById("fridgeName");
		let numItemsAccepted = document.getElementById("numItemsAccepted");
		let contactPerson = document.getElementById("contactPerson");
		let contactPhone = document.getElementById("contactPhone");
		let streetName = document.getElementById("streetName");
		let postalCode = document.getElementById("postalCode");
		let newCity = document.getElementById("city");
		let newProvince = document.getElementById("province");

		let allowedChars = /^[a-z\s]*$/i;

		if(fridgeName.value.match(allowedChars) && !isNaN(numItemsAccepted.value) && fridgeName.value != ""){

			let selectedOptions = [];
			for(let a of typesSelect){
				if(a.selected){
					selectedOptions.push(a.value);
				}
			}

			let newFridgeObj = {
				name:fridgeName.value,
				can_accept_items:numItemsAccepted.value,
				accepted_types: selectedOptions,
				contact_person: contactPerson.value,
				contact_phone: contactPhone.value,
				address: {
					street:streetName.value,
					postal_code:postalCode.value,
					city:newCity.value,
					province: newProvince.value
				}
			}
			console.log(JSON.stringify(newFridgeObj));
			sendNewFridgeToServer(JSON.stringify(newFridgeObj));
		}else{
			alert("Invalid input for Fridge name or Number of items accepted fields.");
		}

	}

	function sendNewFridgeToServer(fridge){
		let successMsg = document.getElementById("respArea2");
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
				successMsg.className = "";
				successMsg.textContent = "New fridge added!";
				console.log(xhttp.responseText);
			}else if(xhttp.status === 400){
				successMsg.className = "";
				successMsg.textContent = xhttp.responseText;
				console.log(xhttp.responseText);
			}else if(xhttp.status === 500){
				successMsg.className = "";
				successMsg.textContent = xhttp.responseText;
				console.log(xhttp.responseText);
			}


		};
		let URL = "http://localhost:8000/fridges";
		xhttp.open("POST", URL, true);
		xhttp.setRequestHeader("Content-type","application/json");
		xhttp.setRequestHeader("Accept", "application/json");
		xhttp.send(fridge);
	}

}


//Edit a fridge code
let editFridgeBtn = document.getElementById("editFridgeBtn");
if(typeof(editFridgeBtn) != "undefined" && editFridgeBtn != null){
	let obj = {};
	let qFridge = window.location.search;
	qFridge = qFridge.substring(qFridge.indexOf('?')+1);
	requestFridgeData("http://localhost:8000/fridges/" + qFridge, -10);


	function editFridge(data){
		//console.log(data);
		let fridgeName = document.getElementById("fridgeName");
		fridgeName.value = data.name;
		let numItemsAccepted = document.getElementById("numItemsAccepted");
		numItemsAccepted.value = data.can_accept_items;
		let contactPerson = document.getElementById("contactPerson");
		contactPerson.value = data.contact_person;
		let contactPhone = document.getElementById("contactPhone");
		contactPhone.value = data.contact_phone;
		let streetName = document.getElementById("streetName");
		streetName.value = data.address.street;
		let postalCode = document.getElementById("postalCode");
		postalCode.value = data.address.postal_code;
		let newCity = document.getElementById("city");
		newCity.value = data.address.city;
		let newProvince = document.getElementById("province");
		newProvince.value = data.address.province;

		let typesSelect = document.getElementById('typesSelect');

		for(type of data.accepted_types){
			let option = document.createElement('option');
			option.value = type;
			option.innerHTML = type;
			option.style.backgroundColor = "green";
			typesSelect.appendChild(option);
		}

		requestItemsList("http://localhost:8000/items", obj, -2);


	}

	function editAcceptedTypes(data){
		let typesSelect = document.getElementById('typesSelect');
		//console.log(data);
		types = [];
		typesSelectChildren = []

		for(let a of typesSelect.children){
			typesSelectChildren.push(a.innerHTML);
		}
		//console.log(typesSelectChildren);

		for(prop in data){
			if( !(types.includes(data[prop].type)) ){
				types.push(data[prop].type);
			}
		}
		//console.log(types);

		for(let type of types){
			if( !(typesSelectChildren.includes(type)) ){
				let option = document.createElement('option');
				option.value = type;
				option.innerHTML = type;
				typesSelect.appendChild(option);
			}
		}

	}

	editFridgeBtn.addEventListener("click", validateEditFridge);

	function validateEditFridge(){
		let typesSelect = document.getElementById('typesSelect');
		selectedArr = [];
		for(let a of typesSelect){
			if(a.selected){
				selectedArr.push(a.value);
			}
		}
		editObj = {
			name:document.getElementById('fridgeName').value,
			can_accept_items:document.getElementById('numItemsAccepted').value,
			accepted_types: selectedArr,
			contact_person: document.getElementById('contactPerson').value,
			contact_phone: document.getElementById('contactPhone').value,
			address: {
				street:document.getElementById('streetName').value,
				postal_code:document.getElementById('postalCode').value,
				city:document.getElementById('city').value,
				province: document.getElementById('province').value
			}

		}

		for(let m in editObj.address){
			if(editObj.address[m] == ""){
				delete editObj.address[m];
			}
		}

		if(Object.keys(editObj.address).length == 0){
			delete editObj.address;
		}

		for(let i in editObj){
			if(editObj[i] == "" || editObj[i] == [] || editObj[i] == null || editObj[i] == undefined){
				delete editObj[i];
			}
		}

		if(Object.keys(editObj).length == 0){
			alert("Invalid data!");
		}else{
			let allowedChars = /^[a-z\s]*$/i;
			if( (editObj.name == undefined && !isNaN(editObj.can_accept_items)) || (editObj.name == undefined && editObj.can_accept_items == undefined) || (editObj.name.match(allowedChars) && editObj.can_accept_items == undefined) || (editObj.name.match(allowedChars) && !isNaN(editObj.can_accept_items))  ){
				console.log("accepted!");
				console.log(qFridge);
				let URL = "http://localhost:8000/fridges/" + qFridge;

				console.log(editObj);
				sendUpdatedFridgeToServer(JSON.stringify(editObj), URL);

			}else{
				alert("Invalid data!");
			}

		}

	}

	function sendUpdatedFridgeToServer(editObj, URL){
		let successMsg = document.getElementById("respArea3");
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
				successMsg.className = "";
				console.log(xhttp.responseText);
			}else if(xhttp.status === 400){
				successMsg.className = "";
				successMsg.textContent = xhttp.responseText;
				console.log(xhttp.responseText);
			}else if(xhttp.status === 500){
				successMsg.className = "";
				successMsg.textContent = xhttp.responseText;
				console.log(xhttp.responseText);
			}


		};
		xhttp.open("PUT", URL, true);
		xhttp.setRequestHeader("Content-type","application/json");
		xhttp.setRequestHeader("Accept", "application/json");
		xhttp.send(editObj);
	}



}




function requestFridgeData(URL, fridgeIndex){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
			let data = xhttp.responseText;
			data = JSON.parse(data);
			if(fridgeIndex == -10){
				editFridge(data);
			}else{
				displayFridgeContents(data, fridgeIndex);
			}

		}

	};
	xhttp.open("GET", URL, true);
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();
}

function requestItemsList(URL, selectedFridge, val){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
			let data = xhttp.responseText;
			data = JSON.parse(data);

			if(val){
				if(val == -1){
					addNewFridge(data);
				}else if(val == -2){
					editAcceptedTypes(data);
				}else if(val == -3){
					processCart(data, selectedFridge);
				}

			}else{
				populateLeftMenu(selectedFridge, data);
				placeHolder(selectedFridge, data);
			}


		}
	};
	xhttp.open("GET", URL, true);
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();
}


function displayFridgeContents(selectedFridge, fridgeID){
	document.getElementById("frigeHeading").innerHTML = "Items in the " + selectedFridge.name;
	let bioInformation = "<span id='fridge_name'>" + selectedFridge.name + "</span><br />" + selectedFridge.address.street + "<br />" + selectedFridge.contact_phone;

	document.getElementById("left-column").firstElementChild.innerHTML = bioInformation;
	let capacity = ((selectedFridge.items.length) / (parseInt(selectedFridge.can_accept_items)));
	capacity = Math.round(capacity * 100);

	document.getElementById("meter").innerHTML = "<span style='width: " + (capacity + 14.2)  + "%'>" + capacity + "%</span>";

	//populateLeftMenu(selectedFridge);
	requestItemsList("http://localhost:8000/items", selectedFridge);


	console.log(fridgeID);

}

function placeHolder(selectedFridge, items){
	let middleColumn = document.getElementById("middle-column");
	for(let element of selectedFridge.items){
		let itemID = parseInt(element.id);
		let item = items[itemID];

		let mdItem = document.createElement("div");
		mdItem.className = "item " + item.type;
		mdItem.id = "item-" + itemID;
		mdItem.innerHTML = "<img src='" + item.img + "' width='100px' height='100px'; />";

		let itemDetails = document.createElement("div");
		itemDetails.id = "item_details";
		itemDetails.innerHTML = "<p id='nm-" + itemID + "'>" + item.name + "</p><p>Quantity: <span id='qt-" + itemID + "'>" + element.quantity + "</span></p><p>Pickup item:</p>";

		let buttonsArea = document.createElement("div");
		buttonsArea.className = "pick_button";
		buttonsArea.id = "pickbtn-" + itemID;

		let increaseButton = document.createElement("button");
		increaseButton.className = "button-plus";
		increaseButton.innerHTML = "<i class='fas fa-plus'></i>";
		increaseButton.addEventListener("click", processIncrease);

		let decreaseButton = document.createElement("button");
		decreaseButton.className = "button-minus";
		decreaseButton.innerHTML = "<i class='fas fa-minus'></i>";
		decreaseButton.addEventListener("click", processDecrease);

		let amount = document.createElement("span");
		amount.className = "amount";
		amount.id = "amount-" + itemID;
		amount.textContent = "0";

		buttonsArea.appendChild(increaseButton);
		buttonsArea.appendChild(amount);
		buttonsArea.appendChild(decreaseButton);

		itemDetails.appendChild(buttonsArea);
		mdItem.appendChild(itemDetails);
		middleColumn.appendChild(mdItem);
	}
	document.getElementById("fridges").classList.add("hidden");
	document.getElementById("fridge_details").classList.remove("hidden");
}

function processIncrease(event) {
	let elementId = event.currentTarget.parentElement.id;
	let numID = elementId.split("-")[1];
	let amount = parseInt(document.getElementById("amount-"+numID).textContent);
	let quantity = parseInt(document.getElementById("qt-" + numID).textContent);
	let name = document.getElementById("nm-" + numID).textContent;

	let elementExists = document.getElementById("pk-item-" + numID);

	if(amount < quantity){
		document.getElementById("amount-"+numID).innerHTML = amount + 1;

		if(elementExists == null){
			let li = document.createElement("li");
			li.setAttribute("id", "pk-item-" + numID);
			li.innerHTML = "<span>" + (amount+1) + "</span> x " + name;
			document.getElementById("items_picked").appendChild(li);
		}
		else {
			document.getElementById("pk-item-"+numID).innerHTML = "<span>" + (amount+ 1) + "</span> x " + name;
		}
	}

	let inCart = [];
	let pickupItemsBtn = document.getElementById("pickupItemsBtn");
	for(let a of document.getElementById("items_picked").children){
		inCart.push(a.innerHTML);
	}

	if(inCart.length > 0){
		pickupItemsBtn.className = "";
	}else{
		pickupItemsBtn.className = "hidden";
	}
	pickupItemsBtn.addEventListener("click", Cart);
	//console.log(inCart);
}


function processDecrease(event) {
	let elementId = event.currentTarget.parentElement.id;
	let numID = elementId.split("-")[1];

	let amount = parseInt(document.getElementById("amount-"+numID).textContent);
	let quantity = parseInt(document.getElementById("qt-" + numID).textContent);
	let elementExists = document.getElementById("pk-item-" + numID);
	let name = document.getElementById("nm-" + numID).textContent;

	if(amount > 0){
		document.getElementById("amount-" + numID).innerHTML = parseInt(amount) - 1;
		if(elementExists == null){
				let li = document.createElement("li");
				li.setAttribute("id", "pk-item-" + numID);
				li.innerHTML = "<span>" + parseInt(amount) - 1 + "</span> x " + name;
				document.getElementById("items_picked").appendChild(li);
		}
		else{
			if(amount == 1){
				let item = document.getElementById("pk-item-"+numID);
				console.log("item-"+numID)
				item.remove();
			}
			else{
					document.getElementById("pk-item-"+numID).innerHTML = "<span>" + (amount- 1) + "</span> x " + name;
			}
		}
	}

	let inCart = [];
	let pickupItemsBtn = document.getElementById("pickupItemsBtn");
	for(let a of document.getElementById("items_picked").children){
		inCart.push(a.innerHTML);
	}

	if(inCart.length > 0){
		pickupItemsBtn.className = "";
	}else{
		pickupItemsBtn.className = "hidden";
	}
	pickupItemsBtn.addEventListener("click", Cart);
	//console.log(inCart);
}

function Cart(){
	let finalInCart = [];
	let finalInCartFiltered = [];
	for(let a of document.getElementById("items_picked").children){
		finalInCart.push(a.innerHTML);
	}

	for(let i of finalInCart){
		finalInCartFiltered.push(i.substring(17));
	}

	let obj = {};
	let URL = "http://localhost:8000/items";
	let qFridge = "hi";
	requestItemsList(URL, finalInCartFiltered, -3);

}

function processCart(data, finalInCartFiltered){
	let cartItemIds = [];

	for(let cartItem of finalInCartFiltered){
		for(let item in data){
			if(data[item].name == cartItem){
				cartItemIds.push(data[item].id);
			}
		}

	}


	let URL = "http://localhost:8000/fridges";
	requestFridgeList("http://localhost:8000/fridges" ,cartItemIds);

}

function processCartCont(data, cartItemIds){
	let fridgeName = document.getElementById("fridge_name");
	let fridgeID = "";

	for(let fridge of data){
		if(fridge.name == fridgeName.textContent){
			fridgeID = fridge.id;
			break;
		}
	}

	let URL = "http://localhost:8000/fridges/" + fridgeID + "/items?";

	for(let i =0; i < cartItemIds.length; i++){
		URL += cartItemIds[i];
		if( !(i == cartItemIds.length -1) ){
			URL += "&";
		}
	}

	sendCartServer(URL);
}

function sendCartServer(URL){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
			console.log("deleted!!!");
			console.log(xhttp.responseText);
		}else if(xhttp.status === 404){
			console.log(xhttp.responseText);
		}else if(xhttp.status === 500){
			console.log(xhttp.responseText);
		}

	};

	xhttp.open("DELETE", URL, true);
	xhttp.setRequestHeader("Content-type","application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();

}


function populateLeftMenu(selectedFridge, items){
	let categories = {};

	for(let element of selectedFridge.items){
		//console.log(element);
		let itemID = parseInt(element.id);
		let item = items[itemID];

		let type = item.type;
		if(type in categories == false){
			categories[type] = 1;
		}
		else {
			categories[type]++;
		}
	}

	let leftMenu = document.getElementById("categories");
	for(const[key, value] of Object.entries(categories)){
		let label = key.charAt(0).toUpperCase() + key.slice(1);
		let listItem = document.createElement("li");
		listItem.id = key;
		listItem.className = "category";
		listItem.textContent = label + " (" + value  + ")";

		listItem.addEventListener("click", filterMiddleView);
		leftMenu.appendChild(listItem);
	}
}

function filterMiddleView(event){
	let elements = document.getElementById("middle-column").children;
	let category = event.target.id;

	for(let i = 0; i < elements.length; i++){
		let item = elements[i];
		if(!item.classList.contains(category)){
			item.classList.add("hidden");
		}
		else{
			item.classList.remove("hidden");
		}
	}
}
