// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
// eslint-disable-next-line no-undef
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    // Solves the error: Error: You must set "output.dir" instead of "output.file" when generating multiple chunks.
    // This error comes from using dynamoc imports
    config.output.dir = 'dist';
    config.output.file = undefined;
    return config; // always return a config.
  },
};
