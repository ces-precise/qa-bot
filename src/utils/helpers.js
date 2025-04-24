// src/utils/helpers.js
/**
 * Universal delay function that doesn't depend on Puppeteer
 * @param {number} ms - Milliseconds to wait
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper function to create default scenarios
 */
function createDefaultScenarios() {
  const defaultScenarios = [];
  let id = 1;
  
  ['Tab Navigation', 'Dashboard Controls', 'Responsiveness Test'].forEach(name => {
    defaultScenarios.push({
      id: id++,
      name: name,
      status: 'passed',
      startTime: new Date(),
      endTime: new Date(),
      duration: 5000,
      steps: [],
      warnings: []
    });
  });
  
  return defaultScenarios;
}

module.exports = { 
  wait,
  createDefaultScenarios 
};