import EventEmitter from 'events'
const amqp = require('amqplib')

const connect = {
  open: function open() {
    return amqp.connect(this.options.broker)
      .then((conn) => conn.createChannel())
      .catch((err) => this.emit('error',err))
  }
}
Object.assign(connect, EventEmitter.prototype)

export{connect}