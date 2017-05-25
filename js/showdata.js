//var gatewayID;

$(document).ready(function() {
	
	$("#datatable").hide();

	$.ajax({
		url: '/api/gateway',
		success: function(data) {
			 //gateway = data;
			 listGateway(data);
		}
	});

	$("#listDeviceBtn").click(function() {
		
		$("#datatable tbody").empty();
		$("#datatable").show();

		var sel = document.getElementById("gatewaydev");
		var gatewayName = sel.options[sel.selectedIndex].text;

		$.ajax({
			url: '/api/mqtt',
			success: function(data) {
				console.log(data);
				showData(data, gatewayName);
			}

		// $("#deviceList").show();

		// var sel = document.getElementById("gatewaydev");
		// var gatewayID = sel.options[sel.selectedIndex].value;

		// $.ajax({
		// 	url: '/api/devices',
		// 	success: function(data) {
		// 		listDevice(data, gatewayID);
		// 	}

		});
	});
});

function selectDevice(data) {

	var selIndex = document.getElementById("devdata").selectedIndex;
	var selOption = document.getElementById("devdata").options;

	showData(data, selOption[selIndex].text);
	//console.log(selIndex);
};

function showData(data, option) {

	var table = document.getElementById("datatable").getElementsByTagName('tbody')[0];
	var row;
	var cell1;
	var cell2;
	var cell3;

	for (var i = 0; i < data.length; i++) {

		var prefix = data[i].topic.split('/');

		if (prefix[0] == option) {
			
			row = table.insertRow(-1);
			cell1 = row.insertCell(0);
			cell2 = row.insertCell(1);
			cell3 = row.insertCell(2);

			cell1.innerHTML = data[i].topic;
			cell2.innerHTML = data[i].msg;
			cell3.innerHTML = data[i].timestamp;
		}

	}
}

function clearList(oList) {
	var i;

	for (i = oList.options.length-1; i >= 0; i--) {
		oList.remove(i);
	}
}

function listGateway(data) {
	var i;
	var oSelect = document.getElementById("gatewaydev");
	

	if (oSelect.options.length != 0) {
		clearList(oSelect);
	}


	var oInit = document.createElement("OPTION");
		oSelect.options.add(oInit);
		oInit.text = '- Select a gateway -';

	for (i = 0; i < data.length; i++) {
		var oOption = document.createElement("OPTION");
		oSelect.options.add(oOption);
		oOption.text = data[i].Gatewayname;
		oOption.value = data[i].GatewayID;
	}
};

function listDevice(data, gatewayID) {
	var i;
	var oSelect = document.getElementById("devdata");
	

	if (oSelect.options.length != 0) {
		clearList(oSelect);
	}

	var oInit = document.createElement("OPTION");
		oSelect.options.add(oInit);
		oInit.text = '- Select a device -';

	for (i = 0; i < data.length; i++) {
		
		if (data[i].GatewayID == gatewayID) {
			var oOption = document.createElement("OPTION");
			oSelect.options.add(oOption);
			oOption.text = data[i].Devicename;
			oOption.value = data[i].DeviceID;
		}
	}
};