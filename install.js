const fs = require('fs')
const path = require('path')
const ch = require('child_process')

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
extensions.forEach(async (extension) => {
  const fullpath = path.join(path.resolve(), 'extensions', extension)
  if(!fs.lstatSync(fullpath).isDirectory()) return

  console.log('[Working] Installing modules for ' + extension)

  let out
  const afunc = async () => new Promise((resolve, reject) => {
    out = ch.exec('yarn --prod', { cwd: fullpath }, (err, stdout, stderr) => {
      if(err) {
      console.error('[ERROR] Failed to install modules for ' + extension)
        console.error(err)
        process.exit(1)
      }

      console.log('[SUCCESS] Installed modules for ' + extension)
      resolve()
    })
    out.stdout.on('data', console.log)
  })
  await afunc()
})
