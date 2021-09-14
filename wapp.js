// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const chromiumArgs = [
  '--disable-web-security', '--no-sandbox', '--disable-web-security',
  '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache',
  '--disable-offline-load-stale-cache', '--disk-cache-size=0',
  '--disable-background-networking', '--disable-default-apps', '--disable-extensions',
  '--disable-sync', '--disable-translate', '--hide-scrollbars', '--metrics-recording-only',
  '--mute-audio', '--no-first-run', '--safebrowsing-disable-auto-update',
  '--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list'
];

function startBot() {
  venom
    .create('session', (base64Qrimg, asciiQR, attempts) => { }, (statusSession, session) => { }, { disableWelcome: true, disableSpins: true, useChrome: false, browserArgs: ['--no-sandbox'] })
    //.create('session', (base64Qrimg, asciiQR, attempts) => {}, (statusSession, session) => {}, {disableWelcome: true, disableSpins: true, useChrome: false, browserArgs: chromiumArgs })
    //.create()
    .then((client) => start(client))
    .catch((erro) => {
      console.log(erro);
    });
}

function start(client) {
  client.onMessage((message) => {
    if (message.body === 'Hi' && message.isGroupMsg === false) {
      client
        .sendText(message.from, 'Welcome Venom 🕷')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });
}

module.exports = {
  startBot,
  // WAStatus,
};