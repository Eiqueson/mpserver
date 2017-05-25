
$(document).ready(function() {

	$.ajax({
			url: '/api/gatewayplot',
			success: function(data) {
				 //listDevice(data);
				 countConnection(data);
			}
		});
});

function countConnection(data) {
	var i;
	var countOnline = 0;
	var countOffline = 0;
	var dataset = [];

	for (i = 0; i < data.length; i++) {

		if (data[i].status == 'ONLINE') {
			countOnline++;
		} else if (data[i].status == 'OFFLINE') {
			countOffline++;
		}
	}

	dataset.push({label: 'Online', count: countOnline});
	dataset.push({label: 'Offline', count: countOffline});

	var total = countOnline+countOffline;
	createSChart(dataset, total);
};

//var data2 = [{label: 'Connected', count: 2}, {label: 'Disconnected', count: 1}]

function createSChart(data, total) {

	var svgWidth = 480;
	var svgHeight = 240;
	var radius = Math.min(svgWidth, svgHeight) / 2;
	var donutRadius = radius / 2;
	var legendRectSize = 20;
	var legendSpacing = 4;

	var color = d3.scaleOrdinal().range(["#009900", "#990000", "#000099"]);

	var arc = d3.arc().outerRadius(radius).innerRadius(radius - donutRadius);

	var pie = d3.pie().sort(null).value(function(d) { return d.count; });

	var svg = d3.select('#gwschart').append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.append('g')
		.attr('transform', 'translate(' + radius + ',' + (svgHeight/2) + ')');

	data.forEach(function(d) {
		d.count = +d.count;
	});

	var g = svg.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');
	g.append('path').attr('d', arc).style('fill', function(d) {return color(d.data.label); });
	g.append('text').attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
	.attr('dy', '.35em').style('text-anchor', 'middle')
	.text(function(d) { var percent = Math.round(1000 * d.data.count / total) / 10; return percent + ' %'; });

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
		.attr('x', legendRectSize + 2*legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
		.text(function(d) {return d;} );
};

