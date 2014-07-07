## CellIdToGeo

Support project for [GSMTracker](https://github.com/mdp/GSMTracker)

Takes in the GSMTracker log file, runs it through Google's Geocoder, and
outputs a json file of coordinates.

Requires a Google API Key for their Geocoder, which is limited to a very
stingy 100 queries a day. These most be really expensize for Google to run.

### Usage

    GOOGLE_API_KEY="MYKEY" ./process.js gsm.log -o webviewer/out.json

### Webviewer

The webviewer simply lets you see the route on a Google Map

    node server.js
    open "http://localhost:3000/#out.json"


