const env = process.env.N0DE_ENV || 'development'
const credentials = require(`./.credentials.${env}`)
module.exports = { credentials }
