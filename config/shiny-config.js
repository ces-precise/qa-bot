module.exports = {
  // Dashboard URL
  baseUrl: 'https://sheetsolved.shinyapps.io/preciseSandboxAnalytics/',
  
  // Testing parameters
  concurrentUsers: 1,  // Shiny apps work best with one user at a time
  screenshotsDir: './logs/screenshots',
  
  // Shiny-specific selectors
  selectors: {
    navigationTabs: ['.nav-tabs', '.nav-pills', '[role="tablist"]'],
    tabContent: ['.tab-content', '.tab-pane', '.shiny-tab-output'],
    controls: ['.well', '.sidebar-panel', '.control-panel', '.shiny-input-container'],
    plots: ['.shiny-plot-output', '.plotly', '.highcharts-container'],
    tables: ['.dataTables_wrapper', '.reactable', '.shiny-datatable'],
    loadingIndicator: '.shiny-busy'
  }
};