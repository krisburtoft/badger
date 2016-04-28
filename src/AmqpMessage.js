import {getLogger} from './Logger'
const url = require('url');
const log = getLogger('AmqpMessage')

export class AmqpMessage {
  
  constructor(msg) {
    this.headers = msg.properties.headers
    this.replyTo = msg.properties.replyTo && url.parse(msg.properties.replyTo).path.split('/')[1]
    this[Symbol.for('amqpmessage')] = msg
    this.routingKey = msg.fields.routingKey
    this.body = JSON.parse(msg.content.toString('utf8'))
    log.silly('message', this)
  }
}