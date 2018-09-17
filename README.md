ssim2gtfs
=========================
[![Travis](https://img.shields.io/travis/planarnetwork/ssim2gtfs.svg?style=flat-square)](https://travis-ci.org/planarnetwork/ssim2gtfs) ![npm](https://img.shields.io/npm/v/ssim2gtfs.svg?style=flat-square) ![David](https://img.shields.io/david/planarnetwork/ssim2gtfs.svg?style=flat-square)

ssim2gtfs converts [IATA SSIM](https://www.iata.org/publications/store/Pages/standard-schedules-information.aspx) flight schedule data into a [GTFS](https://developers.google.com/transit/gtfs/) zip containing trips, stops, stop times and calendars.

## Usage

**ssim2gtfs requires [node 10.x](https://nodejs.org) or above**

ssim2gtfs is a CLI tool that can be installed via NPM:

```
npm install -g ssim2gtfs
```

It can be run by specifying the input and output files as CLI arguments:

```
ssim2gtfs flights.ssim gtfs.zip
```

Or using unix pipes:

```
cat flights.ssim | ssim2gtfs > gtfs.zip
```

## Notes

The GTFS does not support many of the fields in the SSIM standard so there is a lot of information that is not retained. 

- An extended route type of [1100](https://developers.google.com/transit/gtfs/reference/extended-route-types) (air service) is used
- All timezones are converted to UTC
- Stop data is derived from [ourairports.com](http://ourairports.com/data/)
- Agency data is derived from [openflights.org/](https://openflights.org/data.html)

## Contributing

Issues and PRs are very welcome. To get the project set up run

```
git clone git@github.com:planarnetwork/ssim2gtfs
npm install --dev
npm test
```

If you would like to send a pull request please write your contribution in TypeScript and if possible, add a test.

## License

This software is licensed under [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).

