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

inherits(IPMA, BaseModule);

_module = IPMA;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

IPMA.prototype.init = function (config) {
    IPMA.super_.prototype.init.call(this, config);

    var self = this;
    self.callback       = _.bind(self.check,self);

    // Create vdev
    self.vDev = this.controller.devices.create({
        deviceId: "IPMA_" + self.id,
        defaults: {
            metrics: {
                title: self.langFile.m_title,
                level: 'off',
                rain: 'off',
                sources: [],
                icon: self.imagePath+'/icon_norain.png'
            }
        },
        overlay: {
            probeType: 'rain',
            deviceType: 'sensorBinary',
        },
        handler: function (command,args){
            if (command === 'update'
                && typeof(args) !== 'undefined') {
                self.check('update');
            }
        },
        moduleId: this.id
    });

    // Invoke the init callback after 1m
    setTimeout(_.bind(self.initCallback,self), 60*1000);

    // trigger a check every 10m
    self.interval = setInterval(_.bind(self.check, self, 'interval'), 10*60*1000);
};

IPMA.prototype.initCallback = function() {
    var self = this;

    self.check('init');
};

IPMA.prototype.stop = function () {
    var self = this;

    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }

    clearInterval(self.interval);
    self.interval = undefined;

    self.callback = undefined;

    IPMA.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

IPMA.prototype.check = function(trigger) {
    self.log('Checking IPMA');
};

