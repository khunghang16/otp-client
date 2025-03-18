import base32 from 'thirty-two'
import crypto from 'crypto'

const hexToInt = hex => parseInt(hex, 16)

const prepareCounter = counter => {
  const hexCounter = counter.toString(16).padStart(16, '0')
  return Buffer.from(hexCounter, 'hex')
}

const toBase32 = value => base32.encode(value).toString().replace(/=/g, '')


const prepareSecret = (secret, algorithm) => {
  const hexSecret = base32.decode(secret).toString('hex')
  return padSecret(hexSecret, algorithm)
}

const padSecret = (secret, algorithm) => {
  const size = { sha1: 20, sha256: 32, sha512: 64 }[algorithm] || 0
  let secretBuffer = Buffer.from(secret, 'hex')
  while (secretBuffer.length < size) {
    secretBuffer = Buffer.concat([secretBuffer, secretBuffer])
  }
  return secretBuffer.slice(0, size)
}

const generateToken = (counter, algorithm, secret, digits) => {
  const hmac = crypto.createHmac(algorithm, prepareSecret(secret, algorithm))
      .update(prepareCounter(counter))
      .digest('hex')
  const offset = hexToInt(hmac.slice(-1))
  const truncatedHash = hmac.substr(offset * 2, 8)
  const sigbit0 = hexToInt(truncatedHash) & 0x7fffffff
  return (sigbit0 % 10 ** digits).toString().padStart(digits, '0')
}

export { toBase32, generateToken, hexToInt, padSecret }
