window.elementSdk = {
  _config: {},
  _onConfigChange: null,
  
  init(options) {
    this._config = options.defaultConfig || {};
    this._onConfigChange = options.onConfigChange;
    
    if (this._onConfigChange) {
      this._onConfigChange(this._config);
    }
    
    return { isOk: true };
  },
  
  setConfig(config) {
    this._config = { ...this._config, ...config };
    if (this._onConfigChange) {
      this._onConfigChange(this._config);
    }
  },
  
  getConfig() {
    return { ...this._config };
  }
};
