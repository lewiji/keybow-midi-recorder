# keybow-midi-recorder

Node application to be used with the Pibow Keybow - experimental midi layout. When hooked up to a USB midi device such as e-drums or keyboard, you can use the bottom row of keys to start and stop recording midi, which is then outputted to a file.

## Current features

* Connect a USB MIDI device to the Keybow
* Use bottom-left key to start/stop recording MIDI
* MIDI is output to SD card (can use rsync to sync across the network to your DAW PC)

## Usage

* Clone or copy repo onto the Keybow via SSH or file manager
* Install node onto your Pi Zero WH: https://github.com/sdesalas/node-pi-zero
* cd to repository folder and run `npm install` and then `npm run start`

## Planned features:

* Create wrapper interface for key input and LED output
* Use keybow LEDs to track recording
* Use web MIDI to transport MIDI over the network
* Automated recording - listen for MIDI in and silence to cut pieces of live playing
* Web interface
