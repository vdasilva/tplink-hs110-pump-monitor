# TPLink HS110 Pump Monitor
Pulled from https://github.com/mchenier/tplink-hs110-pump-monitor

Monitor a tp-link HS110 Kasa Smart Wi-Fi Plug to receive notification on device start and stop.
There is also an alert for device excessive run and idle time.
Useful for a sump pump but could serve other needs.

Written in Node.js using https://github.com/plasticrake/tplink-smarthome-api and https://www.npmjs.com/package/tplink-cloud-api.
You can select if you prefer using the cloud API or Lan API.

The cloud API has some limitation on the number of calls you can do per day so it may be best to use the LAN if possible.

# Usage 

## Using Package

Take a copy of the file example.config.json.
Rename example.config.env to config.json.
Edit the config.json to match your needs every parameter is explained in the config section.

Go to the release section and take the latest version. For Linux and Mac versions, ensure the file is executable.

Place your modified config.jason file in the same directory as the executable file. Run the executable file.

## Using Node.js

Install Node.js if you don't have it. https://nodejs.org/en/download/

```sh
$ git clone https://github.com/mchenier/tplink-hs110-pump-monitor.git && cd tplink-hs110-pump-monitor
$ npm install
```

Rename example.config.env to config.json.
Edit the config.json to match your needs every parameter is explained in the config section.

Just run this command after to start the app.
```
npm start
```

## Using Docker

```sh
git clone https://github.com/mchenier/tplink-hs110-pump-monitor.git && cd tplink-hs110-pump-monitor
```

Rename example.config.env to config.json.
Edit the config.json to match your needs every parameter is explained in the config section.

```sh
docker build -t tplink-hs110-pump-monitor .

docker run --network=host -v <localPath>:/usr/src/app/log -d tplink-hs110-pump-monitor
```

Change < localPath > to something like C:\TPLinkMonitor\tplink-hs110-pump-monitor\log

# Config

This is all parameters you must configure to make the application run. There is a file example.config.json giving you good start to setup your instance.

+ powerThreshold
    + Power at which the device is detected to be started (watt).

+ aliasDevice
    + Name of your device in the TPLink app.

+ emailSender
    + Gmail account you will be using to send email.
    I strongly recommend creating a new gmail account for this app since you will have to give permission to that account for unauthorized google app.
    https://hotter.io/docs/email-accounts/secure-app-gmail/

+ passEmailSender
    + Password for the sender email.

+ emailReceiver
    + Email that will receive the alerts.

+ logFileName
    + Filename of the log. It will be appended with a .log.

+ idleThreshold
    + Time the device can be idle for, before alert is triggered (seconds).

+ repeatRunningAlertEvery
    + Delay between each excessive running alert message (seconds).

+ repeatIdleAlertEvery
    + Delay between each excessive idle alert message (seconds).

+ deviceRunningTimeThreshold
    + Time the device can be running for, before alert is triggered (seconds).

+ nbLineLogEmail
    + Number of lines of the log to send in the email.

+ waitBetweenRead
    + Device will be polled at the rate specified (seconds).

+ enableIdleAlert
    + Enable alerts for excessive idle (on, off).

+ enableRunningAlert
    + Enable alerts for excessive running. (on, off).

+ enableStartAlert
    + Enable alerts when device starts (on, off).

+ enableStopAlert
    + Enable alerts when device stops (on, off).

### LAN API related

+ deviceIP
    + IP of the tp-link plug to monitor. If set to 0.0.0.0 will search for it but I don't recommend it. Was made available because of problem with the search device api.

### Cloud API related

+ apiSelection
    + Use tplink-cloud-api if set to cloud otherwise use tplink-smarthome-api. Other parameters below only usefull for cloud API.
    cloud and lan should be use

+ userTpLink
    + Username to connect in TPLink app.

+ passTpLink
    + Password to connect in TPLink app.

# Package

If you want to make a package. I used the pkg utiliy (https://github.com/zeit/pkg)

```
npm install -g pkg
```

Go in command line in the project directory and type the following.

```
pkg .
```

Just have a config.json in the same directory has the executable and execute it.

# Alert / Log

+ Alert when device start.
+ Alert when device stop.
+ Alert due to device excessive run time.
+ Alert due to device excessive idle time.
+ Reminder alert for device excessive idle and running time.

![Excessive Running Alerts](https://github.com/vdasilva/tplink-hs110-pump-monitor/blob/master/Excessive%20Running%20Alert.png)

![Excessive Idle Alerts](https://github.com/vdasilva/tplink-hs110-pump-monitor/blob/master/Excessive%20Idle%20Alert.png)

You can find logs in the ./log folder. 

There is also a file *_graph.csv to assist with data analysis.

Every alert an email is sent to the email you choose. The last start/stop event will be send in the body of the message.

# Improvement

I made this little project because the need of monitoring my pump is important for me and didn't find anything else that work like I wanted.
If you want to contribute or have a good idea please let me know.
