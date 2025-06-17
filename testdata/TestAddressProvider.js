export class TestAddressProvider {
  has (key) {
    const map = {
      'revane.server.host': 'localhost',
      'revane.server.port': 0
    }
    return map[key] != null
  }

  get (key) {
    const map = {
      'revane.server.host': 'localhost',
      'revane.server.port': 0
    }
    return map[key]
  }
}
