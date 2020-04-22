var CONFIG = require(process.cwd() + '/config.json');

const utils = require("./utils.js");
const logger = utils.logger;
const loggerDebug = utils.loggerDebug;
const tplinkAPI = require('./tplinkAPI.js');

var api;
if(CONFIG.apiSelection == "cloud") {
  api = new tplinkAPI.cloudAPI();    
} 
else {
  api = new tplinkAPI.lanAPI();
}    

var monitoredDevice = {
  started: false,
  lastStartedTime: undefined,
  lastStoppedTime: undefined,
  lastTimeIdleAlert: undefined,
  lastTimeRunningAlert: undefined,
  usage: undefined,
  getPower: function() {
    return ('power' in monitoredDevice.usage ? monitoredDevice.usage.power : monitoredDevice.usage.power_mw/1000);
  },
  init: function() {
    this.started = false;
    this.lastStartedTime = utils.getDate();
    this.lastStoppedTime = utils.getDate();
    this.lastTimeIdleAlert = utils.getDate();
    this.lastTimeRunningAlert = utils.getDate();
    this.usage = undefined;    
  },
  isDeviceStarted: function() { return this.started; },
  isDeviceStopped: function() { return !this.started; },
  getTimeSinceLastStart: function() { utils.getDate() - monitoredDevice.lastStartedTime; },
  getTimeSinceLastStop: function() { utils.getDate() - monitoredDevice.lastStoppedTime; },
  getTimeFromLastRunningAlert: function() { utils.getDate() - monitoredDevice.lastTimeRunningAlert; },
  getTimeFromLastIdleAlert: function() { utils.getDate() - monitoredDevice.lastTimeIdleAlert; },
  startDevice: function() { 
    this.started = true;
    this.lastStartedTime = utils.getDate();
  },
  stopDevice: function() {    
    this.started = false;
    this.lastStoppedTime = utils.getDate();
    utils.saveGraphData(this); 
  }   
}

async function main() {     
  loggerDebug.info("-----Monitoring started!-----");   
  loggerDebug.info("Acceptable Idle             : " + (CONFIG.idleThreshold/60).toFixed(2) + " minutes");
  loggerDebug.info("Alert for Idle every       : " + (CONFIG.repeatIdleAlertEvery/60).toFixed(2) + " minutes");
  loggerDebug.info("Acceptable Running               : " + (CONFIG.deviceRunningTimeThreshold/60).toFixed(2) + " minutes");
  loggerDebug.info("Alert for Excessive Running every: " + (CONFIG.repeatRunningAlertEvery/60).toFixed(2) + " minutes"); 
  monitoredDevice.init();
  await api.initDevice();

  while (true) {
    try {              
      monitoredDevice.usage = await api.getUsage();   
      monitoring(monitoredDevice.usage);
      // Wait for poll period
      await utils.sleep(CONFIG.waitBetweenRead);  
    }
    catch (err) {
      loggerDebug.info(err);      
    }      
  } 
}

const monitoring = function(usage) {
  try {
    monitoredDevice.usage = usage;   
    
    loggerDebug.info(JSON.stringify(usage));
    verifyStartStop();
    verifyIdleTime();
    verifyRunningTime();
  }
  catch (err) {
    loggerDebug.info(err);
  } 
}

function verifyStartStop() {
  if (monitoredDevice.getPower() > CONFIG.powerThreshold) {            
    if (monitoredDevice.isDeviceStopped()) {
      monitoredDevice.startDevice();
      logger.info(CONFIG.aliasDevice + " Started");
      if(CONFIG.enableStartAlert == "on") {
        utils.sendEmail(CONFIG.aliasDevice + " Started", api);
      }      
    }
  }
  else if (monitoredDevice.isDeviceStarted()) {    
    monitoredDevice.stopDevice();
    logger.info(CONFIG.aliasDevice + " Stopped");
    if(CONFIG.enableStopAlert == "on") {
      utils.sendEmail(CONFIG.aliasDevice + " stopped", api);
    }         
  }
}

function verifyIdleTime() {    
  if (monitoredDevice.getTimeFromLastIdleAlert() >= CONFIG.repeatIdleAlertEvery &&
      monitoredDevice.isDeviceStopped && 
      monitoredDevice.getTimeSinceLastStop() >= CONFIG.idleThreshold) {      
        monitoredDevice.lastTimeIdleAlert = utils.getDate();
        loggerDebug.info(CONFIG.aliasDevice + " Excessive Idle time re-trigger alert raised.");
        if (CONFIG.enableIdleAlert == "on") {
          utils.sendEmail(CONFIG.aliasDevice + " didn't start for the last " + (monitoredDevice.getTimeSinceLastStart())/60 + " minutes", api);    
        }
  }
}

function verifyRunningTime() {
  if (
    monitoredDevice.getTimeFromLastRunningAlert() >= CONFIG.repeatRunningAlertEvery &&
    monitoredDevice.isDeviceStarted() && monitoredDevice.getTimeSinceLastStart() >= CONFIG.deviceRunningTimeThreshold) {
      monitoredDevice.lastTimeRunningAlert = utils.getDate();
      loggerDebug.info(CONFIG.aliasDevice + " Excessive Running time re-trigger alert raised.");
      if (CONFIG.enableRunningAlert == "on") { 
        utils.sendEmail(CONFIG.aliasDevice + " running for more then " + (monitoredDevice.getTimeSinceLastStart())/60 + " minutes", api);    
      }
  }
}

main();
