/*** IPMA Z-Way HA module *******************************************

Version: 1.0.0
(c) Luis Rascao, 2018-2019
-----------------------------------------------------------------------------
Author: Luis Rascao <luis.rascao@gmail.com>
Description:
    This module checks weather data from IPMA (Instituto Portugues do Mar e Atmosfera) 

******************************************************************************/

function IPMA (id, controller) {
    // Call superconstructor first (AutomationModule)
    IPMA.super_.call(this, id, controller);

    this.callback           = undefined;
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
    self.callback = _.bind(self.check, self);

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

    console.log('IPMA initialized');
};

IPMA.prototype.stop = function () {
    var self = this;

    if (self.rainSensor) {
        self.controller.devices.remove(self.rainSensor.id);
        self.rainSensor = undefined;
    }

    clearInterval(self.interval);
    self.interval = undefined;

    self.callback = undefined;

    IPMA.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

IPMA.prototype.check = function() {
    var self = this;

    console.log('Checking IPMA');
};

