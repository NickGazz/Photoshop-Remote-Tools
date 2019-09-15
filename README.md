# Photoshop Remote Tools Plugin
A plugin for Photoshop that utilizes web sockets to allow you to select tools and other photoshop features from another device
## Getting Started
To install the photoshop extension you need to copy this project's root directoiry to ```/Library/Application Support/Adobe/CEP/extensions/```. The server folder and all of its contents are only required if you would like to host your own server, but can be deleted if you just want to use the extension.\
The extension can be enabled in Photoshop by opening Photoshop and selecting Remote Tools from the Window>Extensions menu.
To login in use any username and passphrase. These will not persist and are removed from the system once the last device using those credentials disconnects.
To access the tools from any browser navigate to https://photoshop-remote-tools.herokuapp.com and enter the same username and passphrase.
## Built With
* [Express](https://expressjs.com/)
* [Socket.IO](https://socket.io/)
## Future Plans
* Extend to work with Illustrator and Indesign
## Disclaimer
*The plugin has been developed and tested using macOS Mojave(10.14) and Photoshop CC 2019. It is not gaurenteed to work on any other devices or versions of Photoshop.\
*The web app works on all modern browsers