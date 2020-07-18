const fs = require('fs')
const path = require('path')
const ch = require('child_process')

const compVer = require('compare-versions')

const DB_VER = 'v0.1.0' // current db version
const MIN_DB_VER = 'v0.1.0' // minimum checkpoint db version

const globalElements = require('./classes/globalElements')
globalElements(false)
console.log('Loaded Global Properties and Functions.')

// Run
Promise.all([run(), installDeps()]).then((v) => {
  console.log('Installation completed!')
  process.exit(0)
}).catch((e) => {
  console.error('Error: ' + e.stack)
  process.exit(1)
})

async function run () {
  const config = require('./config')

  console.log('Initializing Database...')
  switch (config.db.type) {
    case 'mysql':
    case 'pg': {
      const knex = require('knex')({
        client: config.db.type,
        connection: config.db.connection
      })

      // 'dbinfo' table (db structure version storage)
      const exists = await knex.schema.hasTable('dbinfo')
      if (!exists) {
        console.log("'dbinfo' table not found. Creating...")
        await knex.schema.createTable('dbinfo', function (t) {
          t.string('DB_VER', 32).notNullable().collate('utf8_unicode_ci')

          if (config.db.type === 'mysql') t.charset('utf8')
        })
        await knex('dbinfo').insert({ DB_VER })
        console.log("Created 'dbinfo' table.")

        // Fresh Install
        dbInstall(config.db.type, knex)
      } else {
        // check db version
        const dbver = (await knex('dbinfo').select('DB_VER'))[0].DB_VER
        console.log('Database structure version: ' + dbver)
        if (compVer.compare(dbver, DB_VER, '=')) {
          console.log('Database structure already at latest version. No need to upgrade.')
        } else if (compVer.compare(dbver, MIN_DB_VER, '>=')) {
          // Run upgrade
          await dbUpgrade(config.db.type, knex)
        } else {
          // db structure outdated. exit.
          throw new Error('Error: The database structure version is outdated. Please upgrade the database structure to ' + MIN_DB_VER + ' to install.\n\nInstallation terminated.')
        }
      }

      break
    }
    case 'json': {
    // JSON Database
      console.log('JSON DB Init...')
      const dbPath = path.join(path.resolve(), 'db')
      if (!fs.existsSync(dbPath) || !fs.lstatSync(dbPath).isDirectory()) {
        fs.mkdirSync(dbPath)
        console.log('Created db directory.')
      }

      const jsonDBPath = path.join(dbPath, 'json')
      if (!fs.existsSync(jsonDBPath) || !fs.lstatSync(jsonDBPath).isDirectory()) {
        fs.mkdirSync(jsonDBPath)
        console.log('Created db/json directory.')
      }

      const guildjson = path.join(jsonDBPath, 'guild.json')
      if (!fs.existsSync(guildjson)) {
        fs.writeFileSync(guildjson, '{}')
        console.log('Created guild.json file.')
      }

      const userjson = path.join(jsonDBPath, 'user.json')
      if (!fs.existsSync(userjson)) {
        fs.writeFileSync(userjson, '{}')
        console.log('Created user.json file.')
      }

      console.log('JSON DB Init complete.')
    }
  }
}

async function installDeps () {
  // Extensions module dependency
  console.log('Installing module dependency for extensions...')
  const extensions = fs.readdirSync(path.join(path.resolve(), 'extensions'))
  await extensions.asyncForEach(async (extension) => {
    const fullpath = path.join(path.resolve(), 'extensions', extension)
    if (!fs.lstatSync(fullpath).isDirectory()) return

    console.log('[Working] Installing modules for ' + extension)

    await runInstallDeps(extension, fullpath)
    console.log('[SUCCESS] Installed modules for ' + extension)
  })
}

async function dbInstall (type, obj) {
  switch (type) {
    case 'mysql':
    case 'pg': {
      const knex = obj

      // 'guilds' table
      console.log("Creating 'guilds' table...")
      await knex.schema.createTable('guilds', function (t) {
        t.string('id', 20).primary().notNullable().collate('utf8_unicode_ci')
        t.boolean('activated').notNullable().defaultTo(false)
        t.string('prefix', 11).nullable().collate('utf8_unicode_ci')
        t.string('locale', 5).notNullable().defaultTo('ko_KR').collate('utf8_unicode_ci')

        if (type === 'mysql') t.charset('utf8')
      })
      console.log("Created table 'guilds'.")

      // 'users' table
      console.log("Creating 'users' table...")

      await knex.schema.createTable('users', function (t) {
        t.string('id', 20).primary().notNullable().collate('utf8_unicode_ci')
        t.string('locale', 5).notNullable().defaultTo('ko_KR').collate('utf8_unicode_ci')
        if (type === 'mysql') t.charset('utf8')
      })
      console.log("Created table 'users'.")

      break
    }
  }
}

async function dbUpgrade (type, obj) {
  switch (type) {
    case 'mysql':
    case 'pg': {
      const knex = obj
      await knex.schema.table('users', function (t) {
        t.string('locale', 5).notNullable().defaultTo('ko_KR').collate('utf8_unicode_ci')
      })
    }
  }
}

function runInstallDeps (extension, fullpath) {
  return new Promise((resolve, reject) => {
    const out = ch.exec('yarn --prod', { cwd: fullpath }, (err, stdout, stderr) => {
      if (err) reject(new Error('[ERROR] Failed to install modules for ' + extension + ': ' + err.stack))

      resolve()
    })
    out.stdout.on('data', console.log)
    out.stderr.on('data', console.log)
  })
}
