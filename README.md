# Open Pension
[![Build Status](https://travis-ci.org/hasadna/OpenPension.png?branch=master)](https://travis-ci.org/hasadna/OpenPension)

Import pension "single asset" files into unfied DB.


## Installation

Prerequisites

ssconvert
```shell
sudo apt-get install gnumeric
```

Clone and initialize submodules
```shell
git clone ...
git submodule init
git submodule update
```
and then simply run
```shell
npm install
```
    
## Usage

```shell
node index.js debug
```

This will load the sample xlsx(res/migdal.xlsx), and import it into dump.csv.

## License

See LICENSE file.
