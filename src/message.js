import {getLogger} from './Logger'
const url = require('url');

export class AmqpMessage {
  constructor(msg) {
    this.msg = msg
    this.log = getLogger('AmqpMessage')
    this.log.silly('message', msg)
    this.replyTo = msg.properties.replyTo && url.parse(msg.properties.replyTo).path.split('/')[1]
    this.routingKey = msg.fields.routingKey
    console.log(JSON.stringify(msg.properties,null,4))
  }
  get body() {
    this.parsedBody = this.parsedBody || this.msg.content.toString('utf8')
    this.log.verbose('msg content', this.parsedBody)
    return JSON.parse(this.parsedBody)
  }
}