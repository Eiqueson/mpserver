var device;

$(document).ready(function() {

	$.ajax({
		url: '/api/devices',
		success: function(data) {
			 device = data;
			 //listDevice(data);
			 countDevice(device);
		}
	});

	/*$("#devInfoBtn").click(function() {
		var selIndex = document.getElementById("devname").selectedIndex;
		var selOption = document.getElementById("devname").options;
		var name = selOption[selIndex].text;

		for (var i = 0; i < device.length; i++) {
			if (device[i].Devicename === name) {
				//devID = device[i].DeviceID;
				document.getElementById("devnameinfo").value = device[i].Devicename;
				document.getElementById("macaddr").value = device[i].MACaddress;
				document.getElementById("location").value = device[i].Location;
				document.getElementById("timeint").value = device[i].Timeinterval;
				document.getElementById("topic").value = device[i].Topic;
				document.getElementById("plugin").value = device[i].Plugin;
				document.getElementById("desc").value = device[i].Description;
				document.getElementById("std").value = device[i].Standard;
			}
		}
	});*/

});

function listDevice(data) {
	var i;
	var oSelect = document.getElementById("devname");

	if (oSelect.options.length != 0) {
		clearList(oSelect);
	}

	var oInit = document.createElement("OPTION");
		oSelect.options.add(oInit);
		oInit.text = '- Select a device -';

	for (i = 0; i < data.length; i++) {
		var oOption = document.createElement("OPTION");
		oSelect.options.add(oOption);
		oOption.text = data[i].Devicename;
		oOption.value = data[i].Devicename;
	}
};

function countDevice(data) {
	var i;
	var countWifi = 0;
	var countBle = 0;
	var count802154 = 0;
	var dataset = [];

	for (i = 0; i < data.length; i++) {

		if (data[i].Standard === "80211") {
			countWifi++;
		} else if (data[i].Standard === "ble") {
			countBle++;
		} else if (data[i].Standard === "802154") {
			count802154++;
		}
	}

	dataset.push({label: 'WiFi', count: countWifi});
	dataset.push({label: 'BLE', count: countBle});
	dataset.push({label: 'IEEE 802.15.4', count: count802154});

	document.getElementById("count").innerHTML = countWifi+countBle+count802154;
	createChart(dataset);
};

function createChart(dataset) {

	var width = 480;
	var height = 200;
	var radius = Math.min(width, height) / 2;
	var donutWidth = 50;

	var legendRectSize = 20;
	var legendSpacing = 4;

	var color = d3.scaleOrdinal().range(["#990000", "#009900", "#000099"]);

	var svg = d3.select('#chart')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + (width/3) + ',' + (height/2) + ')');

	var arc = d3.arc()
		.innerRadius(radius - donutWidth)
		.outerRadius(radius);

	var pie = d3.pie()
		.value(function(d) {return d.count;} )
		.sort(null);

	var tooltip = d3.select('#chart')
		.append('div')
		.attr('class', 'tooltip');

	tooltip.append('div').attr('class', 'label');
	tooltip.append('div').attr('class', 'count');
	tooltip.append('div').attr('class', 'percent');

	dataset.forEach(function(d) {
		d.count = +d.count;
	});

	var path = svg.selectAll('path')
		.data(pie(dataset))
		.enter()
		.append('path')
		.attr('d', arc)
		.attr('fill', function(d, i) {
			return color(d.data.label);
		});

	path.on('mouseover', function(d) {
		var total = d3.sum(dataset.map(function(d) {
			return d.count;
		}));

		//console.log(d);
		var percent = Math.round(1000 * d.data.count / total) / 10;
		tooltip.select('.label').html(d.data.label);
		tooltip.select('.count').html(d.data.count);
		tooltip.select('.percent').html(percent + '%');
		tooltip.style('display', 'block');
	});

	path.on('mouseout', function(d) {
		tooltip.style('display', 'none');
	});

	var legend = svg.selectAll('.legend')
		.data(color.domain())
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i) {
			var height = legendRectSize + legendSpacing;
			var offset = height * color.domain().length / 2;
			var horz = 8 * legendRectSize;
			var vert = i * height - offset;
			return 'translate(' + horz + ',' + vert + ')';
		});

	legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', color)
		.style('stroke', color);

	legend.append('text')
		.attr('x', legendRectSize + legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
		.text(function(d) {return d;} );
};

