var devStatus = [];
var gwList = [];

$(document).ready(function() {
	
	//gatewayReachable();

	$.ajax({
		url: '/api/devices',
		success: function(data) {
			 //gateway = data;
			 setTimeout(function() {
				listDevice(data);
			 }, 250);
		}
	});

	$.ajax({
		url: '/api/devstatus',
		success: function(data2) {
			 devStatus = data2;
		}
	});

	$.ajax({
		url: '/api/gateway',
		success: function(data3) {
			gwList = data3;
		}
	});

});

function getDevStatus(mac) {
	var result = 'DISCONNECTED';

	for (var i = 0; i < devStatus.length; i++) {
		if (devStatus[i].mac == mac) {
			
			result = devStatus[i].status;
		}
	}

	return result;
};

function getGatewayName(gwID) {
	var name = '';

	for (var i = 0; i < gwList.length; i++) {
		if (gwList[i].GatewayID == gwID) {
			
			name = gwList[i].Gatewayname;
		}
	}

	return name;
}

function listDevice(data) {

	var table = document.getElementById("devicetable");
	var row;
	var cell1;
	var cell2;
	var cell3;
	var cell4;
	var cell5;

	for (var i = 0; i < data.length; i++) {

		row = table.insertRow(-1);
		cell1 = row.insertCell(0);
		cell2 = row.insertCell(1);
		cell3 = row.insertCell(2);
		cell4 = row.insertCell(3);
		cell5 = row.insertCell(4);

		cell1.innerHTML = data[i].Devicename;
		cell2.innerHTML = data[i].Location;
		cell3.innerHTML = data[i].Standard;
		cell4.innerHTML = getGatewayName(data[i].GatewayID);
		cell5.innerHTML = getDevStatus(data[i].MACaddress);
		if (cell5.innerHTML == 'CONNECTED') {
			cell5.setAttribute("style", "color: green;");
		} else {
			cell5.setAttribute("style", "color: red;");
		}
	}
};