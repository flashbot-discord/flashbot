const fs = require('fs')
const path = require('path')
const ch = require('child_process')

const globalElements = require('./classes/globalElements')
globalElements(false)
console.log('Loaded Global Properties and Functions.')

run().then(() => {
  console.log('Installation completed!')
  process.exit(0)
})

async function run () {
  const config = require('./config.json')

  console.log('Initializing Database...')
  switch (config.db.type) {
    case 'mysql': {
      const knex = require('knex')({
        client: config.db.type,
        connection: config.db.connection
      })

      // 'guilds' table
      const exists = await knex.schema.hasTable('guilds')
        if (!exists) {
          console.log("'guilds' table not found. Creating...")
          await knex.schema.createTable('guilds', function (t) {
            t.string('id', 20).primary().notNullable().collate('utf8_unicode_ci')
            t.boolean('activated').notNullable().defaultTo(false)
            t.string('prefix', 11).nullable().collate('utf8_unicode_ci')
            t.string('locale', 5).notNullable().defaultTo(config.defaultLocale || 'ko_KR').collate('utf8_unicode_ci')
            t.charset('utf8')
          })
          console.log("Created table 'guilds'.")
        } else console.log("'guilds' table already exists. Skipping.")

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
