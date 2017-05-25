var gwStatus = [];

$(document).ready(function() {
	
	//gatewayReachable();

	$.ajax({
		url: '/api/gateway',
		success: function(data) {
			 //gateway = data;
			 listGateway(data);
		}
	});

	$.ajax({
		url: '/api/gatewayip',
		success: function(data2) {
			 gwStatus = data2;
		}
	});

});

// function gatewayReachable() {
// 	var xhr = new XMLHttpRequest();
// 	var file = "http://cors.io/?u=" + "http://10.2.14.6:8888/image/mp_logo.png";
// 	//var file = "http://10.2.14.6:8000/image/mp_logo.png";
// 	//var r = Math.round(Math.random()*10000);
// 	xhr.open("HEAD", file, true);
// 	try {
// 		xhr.send();
// 		console.log(xhr.status);
// 		if (xhr.status >= 200 && xhr.status < 304) {
// 			status = "ONLINE";
// 			return true;
// 		} else {
// 			status = "OFFLINE";
// 			return false;
// 		}
// 	} catch (e) {
// 		return false;
// 	}
// }

function getStatus(name) {
	var result = 'OFFLINE';

	for (var i = 0; i < gwStatus.length; i++) {
		if (gwStatus[i].name == name) {
			
			result = gwStatus[i].status;
		}
		console.log(gwStatus[i].name);
	}

	return result;
};

function createLink(name) {
	var link;

	if (gwStatus.length == 0) {
		link = document.createElement("a");
		link.setAttribute("href", "http://127.0.0.1:8000");
		link.setAttribute("target", "_blank");
	} else {
		for (var i = 0; i < gwStatus.length; i++) {
			if (gwStatus[i].name == name) {
				link = document.createElement("a");
				link.setAttribute("href", "http://" + gwStatus[i].ip + ":8888");
				link.setAttribute("target", "_blank");
				break;
			} else {
				link = document.createElement("a");
				link.setAttribute("href", "http://127.0.0.1:8000");
				link.setAttribute("target", "_blank");
			}
		}
	}

	return link;
};

function listGateway(data) {

	var table = document.getElementById("gatewaytable");
	var row;
	var cell1;
	var cell2;
	var cell3;
	var cell4;

	var btn;
	var a;

	for (var i = 0; i < data.length; i++) {
			
		btn = document.createElement("input");
		btn.type = "button";
		btn.className = "btn btn-default";
		btn.value = "Go";

		a = createLink(data[i].Gatewayname);
		// a = document.createElement("a");
		// a.setAttribute("href", "http://10.2.14.6:8888");
		// a.setAttribute("target", "_blank");

		row = table.insertRow(-1);
		cell1 = row.insertCell(0);
		cell2 = row.insertCell(1);
		cell3 = row.insertCell(2);
		cell4 = row.insertCell(3);

		cell1.innerHTML = data[i].Gatewayname;
		cell2.innerHTML = data[i].Location;
		cell3.innerHTML = getStatus(data[i].Gatewayname);
		// cell2.setAttribute("style", "color: blue;");
		if (cell3.innerHTML == 'ONLINE') {
			cell3.setAttribute("style", "color: green;");
		} else {
			cell3.setAttribute("style", "color: red;");
		}
		a.appendChild(btn);
		cell4.appendChild(a);

	}
};