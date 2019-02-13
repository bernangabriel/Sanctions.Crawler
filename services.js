const path = require('path');
const Service = require('node-windows').Service;

const ServiceName = "Criminal-Search-Service";

var svc = new Service({
    name: ServiceName,
    description: 'Service for search criminals in (fbi, interpool, ofac)',
    script: path.resolve(__dirname, 'server.js')
});

//Get input parameters (install or uninstall)
const action = process.argv[2];

//Listening for detecting installed event to start the windows-service
svc.on('install', () => {
    svc.start();
    console.log(`Windows Service Install And Start Succesfully, Service-Name: ${ServiceName}`);
});

//Uninstall windows-service
svc.on('uninstall', () => {
    console.log(`Windows Service Uninstall Succesfully, Service-Name: ${ServiceName}`);
});

//Install Service
if (action === 'install') {
    svc.install();
}

//Uninstall Service
if (action === 'uninstall') {
    svc.uninstall();
}