const fs = require('fs')
const path = require('path')
const ch = require('child_process')

const compVer = require('compare-versions')
const db = require('./database')

const globalElements = require('../../src/structures/globalElements')
globalElements(false)
console.log('Loaded Global Properties and Functions.')

// Run
run().then(installDeps).then((v) => {
  console.log('Installation completed!')
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})

async function run () {
  console.log('[DB] Setting up Database...')
  await db.init()

  const {
    canUpgrade,
    shouldUpgrade,
    isFresh
  } = await db.check()
  if (canUpgrade && !shouldUpgrade) {
    // same latest version.
    console.log('Database structure already at latest version. No need to upgrade.')
  } else if (!canUpgrade && !shouldUpgrade) {
    // Cannot Downgrade
    throw new Error('Newer database version detected. Cannot downgrade.\n\nInstallation terminated.')
  } else if (canUpgrade && shouldUpgrade) {
    // db install or upgrade
    if (isFresh) await db.setup()
    else await db.upgrade()
  } else {
    // !canUpgrade && shouldUpgrade
    // db structure outdated. exit.
    throw new Error(`The database structure version is outdated. Please upgrade the database structure to ${MIN_DB_VER} or higher. Installation terminated.`)
  }

  console.log('[DB] Setup complete!')
}

async function installDeps () {
  // Extensions module dependency
  console.log('Installing module dependency for extensions...')
  const extensions = fs.readdirSync(path.join(path.resolve(), 'extensions'))
  await extensions.asyncForEach(async (extension) => {
    const fullpath = path.join(path.resolve(), 'extensions', extension)
    if (!fs.lstatSync(fullpath).isDirectory()) return

    console.log('[Extension] Installing dependencies for ' + extension)

    await runInstallDeps(extension, fullpath)
    console.log('[Extension] Dependency installation success for ' + extension)
  })
}

function runInstallDeps (extension, fullpath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(fullpath, 'package.json'))) {
      console.log(`[Extension] Cannot find package.json on ${extension}. Skipping.`)
      resolve()
      return
    }

    const out = ch.exec('yarn --prod', { cwd: fullpath }, (err, stdout, stderr) => {
      if (err) reject(new Error(`[Extension] Failed to install dependencies for ${extension}: ${err.stack}`))

      resolve()
    })
    out.stdout.on('data', console.log)
    out.stderr.on('data', console.log)
  })
}
