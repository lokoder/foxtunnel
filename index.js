var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: "./http.png",
  onClick: handleClick
});


exports.onUnload = function (reason) {

	if (pid) {

		var child_process = require("sdk/system/child_process");

		console.log('kill -9 no PID ' + pid);
		var kill = child_process.spawn('/bin/kill', ['-9', ''+ pid]);
	}
};



var PROXY = { HTTP:1, SOCKS:2 };


function setProxy(type) {

	var prefsvc = require("sdk/preferences/service");

	prefsvc.set("network.proxy.type", 1);

	console.log("dentro de setProxy");

	if (type == PROXY.HTTP) {
		
		console.log("http!!!");
		prefsvc.set("network.proxy.http", 'webfilter.trtsp.jus.br');
		prefsvc.set("network.proxy.http_port", 3128);
		prefsvc.set("network.proxy.share_proxy_settings", true);
		button.icon = "./http.png";

	} else if (type == PROXY.SOCKS) {

		console.log("socks!!!");
		prefsvc.set("network.proxy.socks", 'localhost');
		prefsvc.set("network.proxy.socks_port", 10000);
		prefsvc.set("network.proxy.socks_remote_dns", true);
		prefsvc.set("network.proxy.socks_version", 5);
		prefsvc.set("network.proxy.share_proxy_settings", false);
		button.icon = "./socks.png";
	}
}


var pid = 0;

function handleClick(state) {

	var child_process = require("sdk/system/child_process");

	if (pid) {

		console.log('kill -9 no PID ' + pid);
		var kill = child_process.spawn('/bin/kill', ['-9', ''+ pid]);

		kill.stderr.on('data', function(data) {
			console.log('ERRO NO KILL: ' + data);
		});
	
	} else {

		var ls = child_process.spawn('/usr/bin/ssh', ['-N', '-D 10000', 'erick@localhost']);
		pid = ls.pid;
		console.log("Criada conexão SSH... PID: " + pid);
		setProxy(PROXY.SOCKS);

		ls.stderr.on('data', function (data) {
			console.log('stderr: ' + data);
		});

		ls.on('close', function (code) {
		  console.log('A conexão SSH foi encerrada: ' + code);
		  pid = 0;
		  setProxy(PROXY.HTTP);
		});

		ls.on('error', function(code) {
		  console.log('ERRO: falha ao executar comando');
		  pid = 0;
		  setProxy(PROXY.HTTP);
		});
	}

}
