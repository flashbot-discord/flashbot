const fs = require('fs')
const path = require('path')

const dbPath = path.join(path.resolve(), 'db')
if(!fs.existsSync(dbPath) || !fs.lstatSync(dbPath).isDirectory()) {
  fs.mkdirSync(dbPath)
  console.log('Created db directory.')
}

const jsonDBPath = path.join(dbPath, 'json')
if(!fs.existsSync(jsonDBPath) || !fs.lstatSync(jsonDBPath).isDirectory()) {
  fs.mkdirSync(jsonDBPath)
  console.log('Created db/json directory.')
}

const guildjson = path.join(jsonDBPath, 'guild.json')
if(!fs.existsSync(guildjson)) {
  fs.writeFileSync(guildjson, '{}')
  console.log('Created guild.json file.')
}

const userjson = path.join(jsonDBPath, 'user.json')
if(!fs.existsSync(userjson)) {
  fs.writeFileSync(userjson, '{}')
  console.log('Created user.json file.')
}

