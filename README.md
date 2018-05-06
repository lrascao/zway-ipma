# zway-ipma

This module creates a
    * virtual binary rain sensor, that indicates whether above
    a certain probability rains or not during the current day.

All data is queried from the IPMA website (Instituto Portugues do Mar e Atmosfera) and therefore only works
in Portugal.

# Configuration

## rainThreshold

List of binary sensors to query.

## poll

Keep the sensor in rain state n-minutes after last rain was detected. Will
un-trip immediately if left empty

# Events

## rain.today

Will be called whenever today exceeds the configured rain probability.

# Installation

For developers and users of older Zway versions installation via git is
recommended.

```shell
cd /opt/z-way-server/automation/userModules
git clone https://github.com/lrascao/zway-ipma.git IPMA --branch latest
```

To update or install a specific version
```shell
cd /opt/z-way-server/automation/userModules/IPMA
git fetch --tags
# For latest released version
git checkout tags/latest
# For a specific version
git checkout tags/1.0.0
# For development version
git checkout -b master --track origin/master
```

# License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or any
later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
