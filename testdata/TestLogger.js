export class TestLogger {
  messages = []

  info (message) {
    this.messages.push(message)
  }

  reset () {
    this.messages = []
  }
}
