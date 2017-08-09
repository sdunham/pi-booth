# Pi Booth
A simple node.js photobooth application built for the Raspberry Pi. Inspired by [Makezine's Raspberry Pi Photo Booth](http://makezine.com/projects/raspberry-pi-photo-booth/).

## Installation
- Clone this repo to your Pi
- Run `npm install` to install project dependencies

## Running Pi Booth
- Run `npm start` & visit http://localhost:3000/
- Optional: Add a path to your start command to dictate where your photos will be stored (ex `npm start /media/pi/photo-drive/`). By default, your photos will be saved to the photos directory in the project root

## Optional Branding
- **Brand Image**: Add an image to `/public/images/` with the name of `brandImage` to have that image displayed in the application nav bar
- **Background Image**: Add an image to `/public/images/` with the name of `backgroundImage` to have that image displayed in the application background when the camera preview isn't being displayed

## Required Hardware
- [Raspberry Pi 2/3](https://www.raspberrypi.org/products/)
- [Raspberry Pi Camera Module v2](https://www.raspberrypi.org/products/camera-module-v2/)

## Optional Hardware
- [HDMI Touchscreen Display](https://www.adafruit.com/product/2407)

## Potential Future Updates
- Add option to take multiple photos in a row (currently only takes 1 photo each time the camera button is clicked)
- Add options to email photos to user(s) after they are taken
