# scannerstream

This project uses VueJS and Node to stream text content to multple users in realtime.

### public_client
This is the part that connects via websockets to a `public_server`. It builds the VueJS-based "dummy terminal".

### public_server
This sits on the backend, listening for events from a `relay`. It then processes those events and passes them along to the listening `public_client` users.

### relay

This watches a text file and pushes the latest lines to a `public_server`.

## Intent
This project was originally used to monitor a local [POCSAG pager decoder](https://en.wikipedia.org/wiki/POCSAG) connected to a scanner and a decoding package. It would then push the newly decoded content to a logfile, and the relay script would push that to a remote server for others to watch the scanner output in realtime via websockets. 

### Hypocrisy?
I recommend NOT using this for that purpose, however. POCSAG transmissions potentially contain personal medical information in plaintext. Don't be a dick. I wrote this for my own educational purposes, and only briefly provided the link to the `public_client` to a couple of close friends, not the general public.

This project can still be useful and adapted for many other purposes, however. And it doesn't have to be just text in realtime. Use your imagination, and the power of weeeeeebsooooockkkkeeeetttttssss.

## Building
* Each project has an npm `package.json`. Run `npm install` on each of them, as usual.
* `public_client` has a gruntfile that needs a `config.local.json` file that contains the output folders for the web content that's built by running `grunt`.
* Check each script for configurable options, especially the key passed between the `relay` and `public_server`.
