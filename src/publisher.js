import {getLogger} from './logger'
import {options} from './options'
import * as url from 'url'
import {_} from 'lodash'
import * as util from 'util'
import {Consumer} from './consumer.js'
import * as shortid from 'shortid'
import {AmqpMessage} from './AmqpMessage'

const P = require('bluebird')
const amqp = require('amqplib')
const connect = require('./connect').connect
const log = getLogger(options.name + ':badger:publisher')
const publisher = {
  bindResponseConsumer: function bind(queue) {
    return this.open()
      .then((channel) => {
        return channel.assertExchange(this.exchangeUri.host, this.exchangeUri.protocol.replace(':',''), { autoDelete: false, durable: false })
          .then(function() {
            return channel
          })
      })
      .tap(() => log.verbose('exhange asserted', this.exchangeUri.host))
      .then((ch) => {
        this.channel = ch
        queue = queue + '.#'
        log.info('binding consumer reply consumer ', this.exchangeUri.host, this.exchangeUri.host, queue, this.options )
        return ch.bindExchange(this.exchangeUri.host, this.exchangeUri.host, queue, { durable: false, autoDelete: false })
          .tap(() => log.info('queue asserted'))
          .then(() => ch.assertQueue(queue, { durable: false, autoDelete: true }) )
          .then(() => ch.bindQueue(queue, this.exchangeUri.host, queue) )
          .then(() => ch.consume(queue, this.handler.bind(this),{ noAck: true }))
      })
  },
  getReply: function(val,routeKey) {
    return this.send(val, routeKey, util.format('%s/%s.reply.%d/%s',this.options.exchange,this.responseQueue,++this.count,this.responseQueue))
  },
  send: function publish(val, routeKey, replyTo) {
    log.info('sending with routekey',replyTo);
    const message = new Buffer(JSON.stringify(val));
    log.verbose('publisher.send:', this.exchangeUri.host, message)
    this.channel.publish(this.exchangeUri.host, routeKey, message, { contentType: 'application/json', replyTo: replyTo})
    if(replyTo) {
      return new P((resolve) => {
        this.queue[Symbol.for('rq' + this.count.toString())] = resolve;
      }).timeout(5000)
    }
  },
  handler: function handler(msg) {
    const parsed = new AmqpMessage(msg)
    const msgId = _.last(parsed.routingKey.split('.'))
    this.queue[Symbol.for('rq' + msgId)](parsed);
  }
}

Object.assign(publisher,connect)

function Publisher(ops) {
  _.assign(options, ops || {})
  console.log('publisher.options',publisher.options)
  publisher.options = options;
  console.log('publisher.options',publisher.options)
  const responseQueue = util.format('%s.%s',options.name,shortid.generate())
  const _pub = {
    exchangeUri: url.parse(options.exchange),
    responseQueue: responseQueue,
    count: 0
  };
  Object.assign(publisher,_pub)
  return publisher.open(options)
    .then(() => publisher.bindResponseConsumer(responseQueue))
    .then(() => publisher)
}

export {Publisher}

