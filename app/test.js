const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const settings = require('./settings.json')
let clients = [];

let getIp = () => {
	let os = require('os');
	let ifaces = os.networkInterfaces();
	let ip;
	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' == iface.family && iface.internal == false) {
				ip = iface.address;
			}
		});
	});
	return ip;
}

let passMessage = (user, msg) => {
	for(let client of clients){
		if(client.name != user){
			server.send([Buffer.from(user), Buffer.from("/send message/"), Buffer.from(msg)], client.port, client.ip, (err) => {});
		}
	}
}

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (data, cinfo) => {
	let info = data.toString().split("/");
	let user = info[0];
	let type = info[1];
	let msg = info.slice(2).join("/");
	switch(type){
	case "send message":
		console.log("[message] "+user+" - "+msg);
		passMessage(user, msg)
		break;
	case "start connection":
		clients.push({name: user, ip: cinfo.address, port: cinfo.port});
		console.log("[info] "+user+" connected");
		passMessage(user, user+" connected")
		break;
	case "close connection":
		clients.splice(clients.indexOf(user));
		console.log("[info] "+user+" disconnected");
		passMessage(user, user+" disconnected")
		break;
	}
});

server.on('listening', () => {
	const address = server.address();
	console.log("[info] "+"started listening on "+address.address+":"+address.port);
});

server.bind({
	address: getIp(),
	port: 16881,
});