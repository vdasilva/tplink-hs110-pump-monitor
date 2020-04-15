var CONFIG = require(process.cwd() + '/config.json');

const utils = require("./utils.js");
const loggerDebug = utils.loggerDebug;

class tplinkAPI {
    constructor() {
        this.device;            
    }

    initDevice() {}
    getUsage() {}
}

class lanAPI extends tplinkAPI {
    constructor() {
        super();
    }
    async initDevice() {
        const { Client } = require('tplink-smarthome-api');
        const client = new Client();
    
        if(CONFIG.deviceIP != "0.0.0.0") {
            this.device = await client.getDevice({host: CONFIG.deviceIP})
        .then((plug)=>{
            if (plug.alias == CONFIG.aliasDevice) {
            loggerDebug.info("Connected: " + plug.alias);     
            return plug;
            }      
        })
        .catch((err) => {
            loggerDebug.info(err);
        });     
        }
        else {
            this.device = await this.lanDiscovery(client)
            .then((plug)=>{
                if (plug.alias == CONFIG.aliasDevice) {
                loggerDebug.info("Discovered: " + plug.alias);     
                return plug;
                }      
            });
        }
    }
    async getUsage() {
        return await this.device.emeter.getRealtime();        
    }

    async lanDiscovery(client) {
        return new Promise(
          (resolve, reject) => {
            client.startDiscovery().on('device-new', (plug) => {
              if (plug.alias == CONFIG.aliasDevice) {            
                resolve(plug);
              }               
            });
        });
    }
}

class cloudAPI extends tplinkAPI {   
    constructor() {
        super();
    } 
    async initDevice() {
        const { login } = require("tplink-cloud-api");    
        
        try {
            var tplink = await login(CONFIG.userTpLink, CONFIG.passTpLink)
            await tplink.getDeviceList();
        }
        catch (err) {
            loggerDebug.info(err); 
            return;
        } 
    
        try {
            this.device = tplink.getHS110(CONFIG.aliasDevice);
        }  
        catch(err) {
            loggerDebug.info(CONFIG.aliasDevice + " " + err);
            return;
        }         
    }
    async getUsage() {
        return await this.device.getPowerUsage();
    }
}

module.exports = {
    lanAPI: lanAPI,
    cloudAPI: cloudAPI
}