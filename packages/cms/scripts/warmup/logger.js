class Logger {
  write(message) {
    process.stdout.write("\n");
    process.stdout.write(message);
  }

  overwrite(message) {
    process.stdout.write("\r\x1b[K");
    process.stdout.write(message);
  }
}

module.exports = new Logger();
