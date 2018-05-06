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

    this.interval           = undefined;
    this.pollTimeout        = undefined;
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
    self.rainSensor = this.controller.devices.create({
        deviceId: "IPMA_" + self.id,
        defaults: {
            deviceType: 'sensorBinary',
            metrics: {
                title: 'IPMA',
                level: 'off',
                rain: 'off',
                icon: self.imagePath+'/icon_norain.png'
            }
        },
        overlay: {
            deviceType: 'sensorBinary',
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

    console.log('[IPMA] initialized, rain probability threshold: ' + self.config.rainProbabilityThreshold.toString());
};

IPMA.prototype.stop = function () {
    var self = this;

    if (self.rainSensor) {
        self.controller.devices.remove(self.rainSensor.id);
        self.rainSensor = undefined;
    }

    clearInterval(self.interval);
    self.interval = undefined;

    IPMA.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

IPMA.prototype.check = function() {
    var self = this;

    var rainProbabilityThreshold = parseFloat(self.config.rainProbabilityThreshold)  || 0;

    console.log('Checking IPMA');
    request = {
        url: IPMA_5_DAY_LOCAL_FORECAST_PREFIX + '/1110600.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    console.log('[IPMA] request: ' + JSON.stringify(request));
    var response = http.request(request);
    console.log('[IPMA] response: ' + JSON.stringify(response));
    if (response.status != 200) {
        console.log('[IPMA] request failed with status ' + response.status.toString());
        return;
    }

    var todaysPrediction = response.data.data[0];
    console.log('[IPMA] todays prediction: ' + JSON.stringify(todaysPrediction));

    var todaysRainProbability = parseFloat(todaysPrediction.precipitaProb);
    var todaysMinTemp = parseFloat(todaysPrediction.tMin);
    var todaysMaxTemp = parseFloat(todaysPrediction.tMax);

    if (todaysRainProbability > self.config.rainProbabilityThreshold) {
        self.rainSensor.set('metrics:level', 'on');
        self.rainSensor.set('metrics:rain', 'on');
    }
};

