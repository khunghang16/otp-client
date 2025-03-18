import { checkIsDefAndNotNull, checkState } from 'precond'
import { generateToken } from './crypto_utils'

const SUPPORTED_ALGORITHMS = ['sha1', 'sha256', 'sha512']

export const DEFAULTS = {
  algorithm: 'sha1',
  digits: 6,
  period: 30,
  epoch: null
}

export default class OTP {
  constructor(secret, options) {
    this.secret = secret
    this.setOptions(options)
  }

  setOptions(options) {
    options = { ...DEFAULTS, ...this, ...options }
    checkIsDefAndNotNull(this.secret, 'secret cannot be null')
    if (typeof options.algorithm === 'string') {
      options.algorithm = options.algorithm.toLowerCase()
    }
    checkState(
        SUPPORTED_ALGORITHMS.includes(options.algorithm),
        `[${options.algorithm}] is not supported`
    )
    checkIsDefAndNotNull(options.digits, 'digits cannot be null')
    checkIsDefAndNotNull(options.period, 'period cannot be null')
    checkState(options.digits > 0, 'digits have to be greater than 0')
    checkState(options.period > 0, 'period has to be greater than 0')
    Object.assign(this, options)
  }

  getTickStart() {
    const epoch = this.getEpoch()
    return new Date(Math.floor(epoch / this.period / 1000) * this.period * 1000)
  }

  getTickEnd() {
    const tickStart = this.getTickStart().getTime()
    return new Date((Math.floor(tickStart / 1000) + this.period) * 1000)
  }

  getTimeUntilNextTick() {
    const epoch = this.getEpoch()
    const difference = this.getTickEnd().getTime() - epoch
    return Math.floor(difference / 1000)
  }

  getEpoch() {
    return this.epoch || Date.now()
  }

  getCounter(offset = 0) {
    return Math.floor(this.getEpoch() / this.period / 1000) + offset
  }

  getToken(offset = 0) {
    const counter = this.getCounter(offset)
    return generateToken(counter, this.algorithm, this.secret, this.digits)
  }
}

//getTimeUntilNextTick
//getToken
