class InternalStorageHandler {
  constructor () {
    this._storage = {}
  }

  register (key = '') {
    if (this.has(key)) throw new Error('storage key already registered')
    else {
      const obj = {}
      this._storage[key] = obj
      return obj
    }
  }

  get (key) {
    if (!this.has(key)) return undefined
    else return this._storage[key]
  }

  has (key) {
    return key in this._storage
  }
}

module.exports = InternalStorageHandler
