//////// PACKAGES ////////

var http 		= require('http');
var express 	= require('express');
var bodyParser 	= require('body-parser');
var path 		= require('path');
var mqtt 		= require('mqtt');
var mysql 		= require('mysql');
var ping		= require('ping');

//////// CONSTANT VARIABLES ////////

const SERVER_PORT = 8888;

var app = express();

//var mqttClient = mqtt.connect('mqtt://127.0.0.1');
var mqttCloud = mqtt.connect('mqtt://m13.cloudmqtt.com',  {
	port: 16514,
	clientId: 'mpgateway_' + Math.random().toString(16).substr(2, 8),
	username: 'robbpzzq',
	password: '5isObLK165G2',
});

var dbConnect = {
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'mpgateway'
};

//////// GLOBAL VARIABLES ////////

//var mqttConnected = false;
var mqttCloudConnected = false;

var data 			= [];
var mpDevices 		= [];
var mpGateway 		= [];
var mpDevicesStatus	= [];
var ipAddr 			= [];
var pingResult 		= [];

//////// INITIAL SETUP ////////

var mysqlConnection = mysql.createConnection(dbConnect);
mysqlConnection.connect();
	
var queryStr = 'SELECT * FROM gateway';
mysqlConnection.query(queryStr, function(err, rows) {
	if (err) throw err;
	else console.log("Get gateways success");

	mpGateway = rows;
	//console.log(rows);
});

var queryStr = 'SELECT * FROM device';
mysqlConnection.query(queryStr, function(err, rows) {
	if (err) throw err;
	else console.log("Get devices success");

	mpDevices = rows;
	//console.log(rows);
});

mysqlConnection.end();

//////// MYSQL CONNECTION ////////

function getGateway(response) {
	var mysqlConnection = mysql.createConnection(dbConnect);
	mysqlConnection.connect();
	
	var queryStr = 'SELECT * FROM gateway';
	mysqlConnection.query(queryStr, function(err, rows) {
		if (err) throw err;
		else console.log("Get gateways success");

		mpGateway = rows;
		response.json(rows);
	});

	mysqlConnection.end();
};

function addGateway(data) {
	var mysqlConnection = mysql.createConnection(dbConnect);
	mysqlConnection.connect();
	
	var queryStr = 'INSERT INTO gateway (Gatewayname, Location, Description) VALUES ("'+ data.name + '","' + data.location + '","'+ data.description + '")';
	mysqlConnection.query(queryStr, function(err, results) {
		if (err) throw err;
		else console.log('Add gateway success');
	});

	mpGateway = [];
	var queryStr = 'SELECT * FROM gateway';
	mysqlConnection.query(queryStr, function(err, rows) {
		if (err) throw err;
		else console.log("Get gateways success");

		mpGateway = rows;
	});

	mysqlConnection.end();
};

function getDevice(response) {
	var mysqlConnection = mysql.createConnection(dbConnect);
	mysqlConnection.connect();
	
	var queryStr = 'SELECT * FROM device';
	mysqlConnection.query(queryStr, function(err, rows) {
		if (err) throw err;
		else console.log("Get devices success");

		//mpDevices = rows;
		response.json(rows);
	});

	mysqlConnection.end();
};

function addDevice(data, gwID) {
	var mysqlConnection = mysql.createConnection(dbConnect);
	mysqlConnection.connect();
	
	var queryStr = 'INSERT INTO device (GatewayID, Devicename, Standard, MACaddress, Location, Timeinterval, Topic, Plugin, Description) VALUES ("' + gwID + '","' + data.Devicename + '","' + data.Standard + '","'+ data.MACaddress + '","' + data.Location + '",' + data.Timeinterval + ',"' + data.Topic + '","' + data.Plugin + '","' + data.Description + '")';
	mysqlConnection.query(queryStr, function(err, results) {
		if (err) throw err;
		else console.log("Add Device success");
	});

	mpDevices = [];
	var queryStr = 'SELECT * FROM device';
	mysqlConnection.query(queryStr, function(err, rows) {
		if (err) throw err;
		else console.log("Get devices success");

		mpDevices = rows;
	});

	mysqlConnection.end();
};

//////// MQTT Client ////////

mqttCloud.on('connect', function() {
	mqttCloudConnected = true;
	console.log('xxxxxxxx Connected with CloudMQTT xxxxxxxx');
	mqttCloud.subscribe('#');
});

mqttCloud.on('message', function(topic, message) {

	if (topic.includes('/GatewayInfo')) {
		var info = JSON.parse(message.toString());
		if (mpGateway.length == 0) {
			addGateway(info);
		} else {
			if (!searchGateway(info.name, mpGateway)) {
				addGateway(info);
			} else {
				console.log(info.name + ' has already existed.');
			}
		}
	}

	if (topic.includes('/IPv4')) {
		var prefix = topic.split('/');
		var gwIP = message.toString();

		if (ipAddr.length == 0) {
			ipAddr.push( {name: prefix[0], ip: gwIP} );
		} else {
			for (x in ipAddr) {
				if (x.name != prefix[0]) {
					ipAddr.push( {name: prefix[0], ip: gwIP} );
				}
			}
		}
		
	}

	if (topic.includes('/Devices')) {
		var prefix = topic.split('/');
		var deviceInfo = JSON.parse(message.toString());
		var gwID;

		if (mpDevices.length == 0) {
			if (mpGateway.length != 0) {
				addDevice(deviceInfo, getGatewayID(prefix[0], mpGateway));
			}
		} else {
			if (!searchDevice(deviceInfo.MACaddress, mpDevices)) {
				if (mpGateway.length != 0) {
					addDevice(deviceInfo, getGatewayID(prefix[0], mpGateway));
				}
			} else {
				console.log(deviceInfo.Devicename + ' (' + deviceInfo.MACaddress + ') has already existed.');
			}
		}
	}

	if (topic.includes('/DevStatus')) {
		var deviceStatus = JSON.parse(message.toString());

		for (var i = 0; i < mpDevices.length; i++) {
			if (mpDevices[i].MACaddress == deviceStatus.mac) {
				mpDevicesStatus.push({ mac: deviceStatus.mac, status: deviceStatus.status});
			}
		}
	}

	//console.log(message.toString());
	if (!((topic.includes('/GatewayInfo')) || (topic.includes('/IPv4')) || (topic.includes('/Devices')) || (topic.includes('/DevStatus')) )) {
		var d = new Date();
		var n = d.toLocaleString();
		data.push( {topic: topic, msg: message.toString(), timestamp: n} );
	}
});

function getGatewayID(name, gateway) {
	var gwID;

	for (var i = 0; i < gateway.length; i++) {
		if (name == gateway[i].Gatewayname) {
			gwID = gateway[i].GatewayID;
		}
	}

	return gwID;
}

function searchDevice(mac, device) {
	var isFound = false;

	for (var i = 0; i < device.length; i++) {
		if (mac == device[i].MACaddress) {
			isFound = true;
		}
	}

	return isFound;
}

function searchGateway(name, gateway) {
	var isFound = false;

	for (var i = 0; i < gateway.length; i++) {
		if (name == gateway[i].Gatewayname) {
			isFound = true;
		}
	}

	return isFound;
}

//////// CONNECTION TEST ////////

function checkGatewayConnection(hosts) {

	//console.log(hosts);
	hosts.forEach(function(host) {
		ping.sys.probe(host.ip, function(isAlive) {
			if (isAlive) {
				console.log(host.ip + ' is online');
				pingResult.push({name: host.name, ip: host.ip, status: 'ONLINE'});
			} else {
				console.log(host.ip + ' is offline');
				pingResult.push({name: host.name, ip: host.ip, status: 'OFFLINE'});
			}
		});
	
	});
};

//////// WEB SERVER ////////

app.listen(SERVER_PORT, function() {
	console.log('Server running at http://127.0.0.1:' + SERVER_PORT + '/');
});

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use((req, res, next) => {
 	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.get('/api/mqtt', function(request, response) {
	//console.log(data);
	response.json(data);
	data = [];
});

app.get('/api/gateway', function(request, response) {
	getGateway(response);
});

app.get('/api/gatewayip', function(request, response) {
	checkGatewayConnection(ipAddr);
	//console.log(pingResult);
	response.json(pingResult);
	pingResult = [];
});

var gplot = [];
app.get('/api/gatewayplot', function(request, response) {
	gplot = pingResult;
	setTimeout(function() {
		response.json(gplot);
		gplot = [];
	}, 500);
});

app.get('/api/devices', function(request, response) {
	getDevice(response);
	//console.log(request.body.standard);
});

app.get('/api/devstatus', function(request, response) {
	response.json(mpDevicesStatus);
	//console.log(request.body.standard);
});

//////// PLUGIN LOADER ////////

//5C:CF:7F:2C:E9:A2
//5C:CF:7F:13:38:6F