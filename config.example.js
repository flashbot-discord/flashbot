module.exports = {
  prefix: '',
  owner: [''],
  db: {
    // Supported database types: mysql(+ mariadb), pg, json
    type: '',
    connection: {
      // if mysql/pg, use the knex connection config vars
      host: '',
      user: '',
      password: '',
      database: ''
    }
  },
  logger: {
    enable: true,
    level: 'chat',
    useDebug: false
  },
  errorWebhook: {
    enable: true,
    mentionOwner: true,
    id: '',
    token: ''
  },
  extensions: {
    extensionName: {
      your: 'config'
    }
  }
}
