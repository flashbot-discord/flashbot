module.exports = {
  prefix: '',
  owner: [''],
  db: {
    // Supported database types: mysql(+ mariadb), pg, json
    type: '',
    connection: {
      // if json, provide the relative path of the root storage folder (TODO)
      folder: '',
      // if mysql/pg, use the knex connection config vars
      host: '',
      user: '',
      password: '',
      database: ''
    }
  },
  extensions: {
    extensionName: {
      your: 'config'
    }
  }
}
