const fs = require('fs')
const path = require('path')
const ch = require('child_process')

const compVer = require('compare-versions')

const DB_VER = '0.1.0' // current db version
const MIN_DB_VER = '0.1.0' // minimum checkpoint db version

const globalElements = require('./classes/globalElements')
globalElements(false)
console.log('Loaded Global Properties and Functions.')

run().then(() => {
  console.log('Installation completed!')
  process.exit(0)
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
      let exists = await knex.schema.hasTable('dbinfo')
      if(!exists) {
        console.log("'dbinfo' table not found. Creating...")
        await knex.schema.createTable('dbinfo', function(t) {
          t.string('DB_VER', 32).notNullable().collate('utf8_unicode_ci')

          if(config.db.type === 'mysql') t.charset('utf8')
        })
        await knex('dbinfo').insert({ DB_VER })
      } else {
        // check db version
        const dbver = await knex('dbinfo').select('DB_VER')
        console.log('Database structure version: v' + dbver)
        if(compVer.compare(dbver, MIN_DB_VER, '>=')) {
          // Run upgrade
          await upgrade('knex', knex)
          
        } else {
          // db structure outdated. exit.
          console.error('Error: The database structure version is outdated. Please upgrade the database structure to v' + MIN_DB_VER + ' to install.\n\nInstallation interrupted.')
          process.exit(1)
        }
      }

      // 'guilds' table
      exists = await knex.schema.hasTable('guilds')
      if (!exists) {
        console.log("'guilds' table not found. Creating...")
        await knex.schema.createTable('guilds', function (t) {
          t.string('id', 20).primary().notNullable().collate('utf8_unicode_ci')
          t.boolean('activated').notNullable().defaultTo(false)
          t.string('prefix', 11).nullable().collate('utf8_unicode_ci')
          t.string('locale', 5).notNullable().defaultTo(config.defaultLocale || 'ko_KR').collate('utf8_unicode_ci')

          if (config.db.type === 'mysql') t.charset('utf8')
        })
        console.log("Created table 'guilds'.")
      } else console.log("'guilds' table already exists. Skipping.")

      // 'users' table
      exists = await knex.schema.hasTable('users')
      if (!exists) {
        console.log("'users' table not found. Creating...")

        await knex.schema.createTable('users', function (t) {
          t.string('id', 20).primary().notNullable().collate('utf8_unicode_ci')
          t.string('locale', 5).notNullable().defaultTo('ko_KR').collate('utf8_unicode_ci')
          if (config.db.type === 'mysql') t.charset('utf8')
        })
        console.log("Created table 'users'.")
      } else console.log("'users' table already exists. Skipping.")

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

  // Extensions module dependency
  console.log('Installing module dependency for extensions...')
  const extensions = fs.readdirSync(path.join(path.resolve(), 'extensions'))
  await extensions.asyncForEach(async (extension) => {
    const fullpath = path.join(path.resolve(), 'extensions', extension)
    if (!fs.lstatSync(fullpath).isDirectory()) return

    console.log('[Working] Installing modules for ' + extension)

    await inst(extension, fullpath)
    console.log('[SUCCESS] Installed modules for ' + extension)
  })
}

async function upgrade(type, data) {
  switch(type) {
    case 'knex': {
      const knex = data
      await knex.schema.table('users', function(t) {
        t.string('locale', 5).notNullable().defaultTo('ko_KR').collate('utf8_unicode_ci')
      })
    }
  }
}

function inst (extension, fullpath) {
  return new Promise((resolve, reject) => {
    const out = ch.exec('yarn --prod', { cwd: fullpath }, (err, stdout, stderr) => {
      if (err) {
        console.error('[ERROR] Failed to install modules for ' + extension)
        console.error(err)
        process.exit(1)
      }

      resolve()
    })
    out.stdout.on('data', console.log)
  })
}
