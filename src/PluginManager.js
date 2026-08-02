export const PluginManager = {
  plugins: [],
  
  init() {
    console.log("Plugin Manager initialized");
    // Hardcoded plugin list for this static demo.
    // In a real app, this could be fetched from a JSON file.
    const availablePlugins = [
      '/plugins/sample.js'
    ];
    
    availablePlugins.forEach(url => this.loadPlugin(url));
  },
  
  loadPlugin(url) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      console.log(`Plugin loaded: ${url}`);
    };
    script.onerror = () => {
      console.error(`Failed to load plugin: ${url}`);
    };
    document.head.appendChild(script);
  }
};
