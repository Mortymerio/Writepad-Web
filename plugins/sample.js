// Sample Plugin for Writepad Web
(function() {
  // Wait a tiny bit to ensure API is fully mounted
  setTimeout(() => {
    if (!window.WritepadAPI) return;
    
    // Add an UPPERCASE button
    window.WritepadAPI.addToolbarButton('Aa', 'To Uppercase', () => {
      const text = window.WritepadAPI.getText();
      window.WritepadAPI.setText(text.toUpperCase());
    });

    // Add a JSON Formatter button
    window.WritepadAPI.addToolbarButton('JSON', 'Format JSON', () => {
      try {
        const text = window.WritepadAPI.getText();
        const obj = JSON.parse(text);
        window.WritepadAPI.setText(JSON.stringify(obj, null, 2));
      } catch (e) {
        window.WritepadAPI.showNotification("Invalid JSON!");
      }
    });

    console.log("Sample Plugin initialized!");
  }, 100);
})();
