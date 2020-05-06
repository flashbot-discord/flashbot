const fs = require('fs')
const path = require('path')
const ch = require('child_process')

const globalElements = require('./classes/globalElements')
globalElements(false)
console.log('Loaded Global Properties and Functions.')

// JSON Database
console.log('JSON DB Init...')
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

console.log('JSON DB Init complete.')

// Extensions module dependency
console.log('Installing module dependency for extensions...')
const extensions = fs.readdirSync(path.join(path.resolve(), 'extensions'))
extensions.asyncForEach(async (extension) => {
  const fullpath = path.join(path.resolve(), 'extensions', extension)
  if(!fs.lstatSync(fullpath).isDirectory()) return

  console.log('[Working] Installing modules for ' + extension)

  await inst(extension, fullpath)
  console.log('[SUCCESS] Installed modules for ' + extension)
})

function inst(extension, fullpath) {
  return new Promise((resolve, reject) => {
    console.log('Working Directory: ' + fullpath)
    const out = ch.exec('yarn --prod', { cwd: fullpath }, (err, stdout, stderr) => {
      if(err) {
      console.error('[ERROR] Failed to install modules for ' + extension)
        console.error(err)
        process.exit(1)
      }

      resolve()
    })
    out.stdout.on('data', console.log)
  })
}
