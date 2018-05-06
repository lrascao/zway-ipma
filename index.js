/*** IPMA Z-Way HA module *******************************************

Version: 1.0.0
(c) Luis Rascao, 2018-2019
-----------------------------------------------------------------------------
Author: Luis Rascao <luis.rascao@gmail.com>
Description:
    This module checks weather data from IPMA (Instituto Portugues do Mar e Atmosfera) 

******************************************************************************/

const IPMA_5_DAY_LOCAL_FORECAST_PREFIX = 'http://api.ipma.pt/open-data/forecast/meteorology/cities/daily';

function IPMA (id, controller) {
    // Call superconstructor first (AutomationModule)
    IPMA.super_.call(this, id, controller);
}

inherits(IPMA, AutomationModule);

_module = IPMA;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

IPMA.prototype.init = function (config) {
    IPMA.super_.prototype.init.call(this, config);

    var self = this;

    // Create rain sensor
    self.rainProbabilitySensor = this.controller.devices.create({
        deviceId: "IPMA_Rain_Probability_Sensor_" + self.id,
        defaults: {
            deviceType: 'sensorMultilevel',
            probetype: 'temperature',
            metrics: {
                scaleTitle: '%',
                title: 'IPMA rain probability virtual sensor',
                level: '0.0',
                icon: self.imagePath+'/icon_norain.png'
            }
        },
        overlay: {},
        handle: function(command, args) {},
        moduleId: this.id
    });
    // Create max temperature sensor
    self.maxTempSensor = this.controller.devices.create({
        deviceId: "IPMA_Max_Temp_Sensor_" + self.id,
        defaults: {
            deviceType: 'sensorMultilevel',
            probetype: 'temperature',
            metrics: {
                title: 'IPMA max temperature sensor',
                level: '0.0',
                icon: 'temperature'
            }
        },
        overlay: {
            deviceType: 'sensorMultilevel',
        },
        moduleId: this.id
    });
    // Create min temperature sensor
    self.minTempSensor = this.controller.devices.create({
        deviceId: "IPMA_Min_Temp_Sensor_" + self.id,
        defaults: {
            deviceType: 'sensorMultilevel',
            probetype: 'temperature',
            metrics: {
                title: 'IPMA min temperature sensor',
                level: '0.0',
                icon: 'temperature'
            }
        },
        overlay: {
            deviceType: 'sensorMultilevel',
        },
        moduleId: this.id
    });

    this.do_check = function() {
        self.check();
    };

    // Setup event listeners
    this.controller.on("ipma.check", this.do_check);

    // Add Cron schedule to periodically check IPMA
    this.controller.emit("cron.addTask", "ipma.check", {
        minute: [0, 59, 1],
        hour: null,
        weekDay: null,
        day: null,
        month: null
    });

    console.log('[IPMA] initialized, location code: ' + self.config.ipmaLocationCode);
};

IPMA.prototype.stop = function () {
    var self = this;

    if (self.rainProbabilitySensor) {
        self.controller.devices.remove(self.rainProbabilitySensor.id);
        self.rainProbabilitySensor = undefined;
    }
    if (self.maxTempSensor) {
        self.controller.devices.remove(self.maxTempSensor.id);
        self.maxTempSensor = undefined;
    }
    if (self.minTempSensor) {
        self.controller.devices.remove(self.minTempSensor.id);
        self.minTempSensor = undefined;
    }

    IPMA.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

IPMA.prototype.check = function() {
    var self = this;

    var ipmaLocationCode = self.config.ipmaLocationCode;
    request = {
        url: IPMA_5_DAY_LOCAL_FORECAST_PREFIX + '/' + ipmaLocationCode + '.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    console.log('[IPMA] request: ' + JSON.stringify(request));
    var response = http.request(request);
    // console.log('[IPMA] response: ' + JSON.stringify(response));
    if (response.status != 200) {
        console.log('[IPMA] request failed with status ' + response.status.toString());
        return;
    }

    var todaysPrediction = response.data.data[0];
    console.log('[IPMA] todays prediction: ' + JSON.stringify(todaysPrediction));

    var todaysRainProbability = parseFloat(todaysPrediction.precipitaProb);
    var todaysMinTemp = parseFloat(todaysPrediction.tMin);
    var todaysMaxTemp = parseFloat(todaysPrediction.tMax);

    self.rainProbabilitySensor.set('metrics:level', todaysRainProbability);
    self.maxTempSensor.set('metrics:level', todaysMaxTemp);
    self.minTempSensor.set('metrics:level', todaysMinTemp);
};

