#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const { writeFile } = require('./helpers/file-helper');
const { MessagePackageHelper } = require('./helpers/messagePackage-helper');
const sem = require('semaphore');
const moment = require('moment-timezone');
amqp.connect('amqp://localhost:5672', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    const containers = {};
    const semaphores = {};
    //consume(channel, 'presence');
    //consume(channel,'station');
    consume(channel, 'proximity', containers, semaphores);
    consume(channel, 'presence', containers, semaphores);
    consume(channel, 'station', containers, semaphores);
  });

});

async function consume(channel, queue, containers, semaphores) {
  channel.assertQueue(queue, {
    durable: false
  });
  await new Promise((resolve, reject) => {
    channel.consume(queue, async function (msg) {
      const content = JSON.parse(msg.content.toString());
      const { type, sourceId } = content;

      if (!type || !sourceId) {
        console.log('MESSAGE INCORRECT!', content);
        return;
      }
      const key = `${type}`;
      console.count(`CONSUME ${key}`);
      if (!containers[key]) {
        containers[key] = new MessagePackageHelper(10000);
        semaphores[key] = sem(1);
      }
      semaphores[key].take(async () => {
        const messageToFile = containers[key].add(content);
        if (messageToFile) {
          console.log('Saving %d messages from key %s', messageToFile.length, key);
          const date = moment(content.ts).format('YYYY-MM-DD_HH');
          await writeFile(`${key}_${date}`, JSON.stringify(messageToFile));
        }
        semaphores[key].leave();
      });
    }, {
      noAck: true
    });

  });
}