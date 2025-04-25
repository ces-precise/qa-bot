# Shiny Dashboard QA Testing System

This system provides automated testing and quality assurance for Shiny dashboards, with a focus on the Precise Sandbox Analytics dashboard at https://sheetsolved.shinyapps.io/preciseSandboxAnalytics/.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional, for version control)

## Project Structure

The project follows this directory structure:

```
automated-qa-demo/
├── src/
│   ├── runners/
│   │   └── shiny-test-runner.js     # Browser automation and test execution
│   ├── reporting/
│   │   └── report-integration.js    # Process logs and generate reports
│   ├── scenarios/
│   │   └── shiny-scenarios.js       # Test scenario definitions
│   └── utils/
│       ├── helpers.js               # Utility functions
│       └── module-compat.js         # Module compatibility helpers
├── config/
│   └── shiny-config.js              # Configuration settings
├── logs/
│   ├── reports/                     # Generated HTML reports
│   └── screenshots/                 # Test screenshots
├── package.json
└── README.md
```

## Quick Start

1. **Install dependencies:**

```bash
npm install
```

2. **Run the tests:**

```bash
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js
```

3. **View the report:**
   - Navigate to the `logs/reports` directory
   - Open the most recent HTML report in your browser

## Running Tests

### Basic Usage

```bash
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js
```

### Available Options

```
Options:
  --help, -h                   Show this help message
  --open, -o                   Automatically open the report after generation
  --url, -u <url>              URL of the Shiny dashboard to test
  --output-dir, -d <path>      Directory to save the report in
  --screenshots-dir <path>     Directory to save screenshots in
  --log-file <path>            Path to save the log file
  --title <title>              Title for the test report
  --test-runner <path>         Path to the test runner module
```

### Examples

Test a different Shiny dashboard:
```bash
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js --url https://example.com/my-dashboard
```

Specify a custom report title:
```bash
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js --title "My Custom Dashboard Report"
```

Open the report automatically in the browser:
```bash
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js --open
```

## Setting Up Scheduled Tests (Cron Jobs)

For continuous monitoring, you can set up scheduled tests using cron jobs.

### Linux/Mac Cron Setup

1. **Create a shell script** to run the tests:

```bash
# File: run-dashboard-tests.sh
#!/bin/bash

# Navigate to the project directory
cd /path/to/automated-qa-demo

# Run the tests
node src/reporting/report-integration.js --test-runner ../runners/shiny-test-runner.js --open

# Optional: Add notification or upload results
# mail -s "Dashboard Test Report" user@example.com < logs/reports/latest.html
```

2. **Make the script executable:**

```bash
chmod +x run-dashboard-tests.sh
```

3. **Add to crontab** to run at your preferred schedule:

```bash
# Open crontab editor
crontab -e

# Add a line to run daily at 3 AM
0 3 * * * /path/to/run-dashboard-tests.sh >> /path/to/cron_log.txt 2>&1

# Or run weekly on Mondays at 9 AM
0 9 * * 1 /path/to/run-dashboard-tests.sh >> /path/to/cron_log.txt 2>&1
```

### Windows Task Scheduler

1. **Create a batch file** (`run-tests.bat`):

```batch
@echo off
cd C:\path\to\automated-qa-demo
node src\reporting\report-integration.js --test-runner ..\runners\shiny-test-runner.js
```

2. **Set up Task Scheduler:**
   - Open Task Scheduler
   - Create Basic Task
   - Set trigger (daily, weekly, etc.)
   - Action: Start a program
   - Program/script: Select your batch file
   - Finish

## Troubleshooting

### Common Issues

1. **Module not found errors:**
   - Check that file paths are correct
   - Make sure the test runner path is relative to the report-integration.js file, not your current directory
   - Use the `--test-runner` option with the correct path

2. **Elements not found during testing:**
   - Dashboard structure may have changed
   - Increase wait times for elements to load
   - Update selectors in the scenario definitions

3. **Error in controls testing:**
   - Some elements may not be clickable
   - Verify that the dashboard controls are accessible
   - Try adding wait time before interactions

## Adding Custom Test Scenarios

To add custom test scenarios for your specific dashboard features:

1. Open the scenarios file (`src/scenarios/shiny-scenarios.js`)
2. Add a new scenario function following the existing pattern
3. Export the new scenario in the module exports
4. The test runner will automatically pick up and execute your new scenario

Example custom scenario:

```javascript
// Custom scenario for testing dashboard filters
testFilters: {
  name: 'Test Dashboard Filters',
  weight: 5,
  execute: async (page) => {
    // Implementation of filter testing
    console.log('Testing dashboard filters...');
    
    // Find filter controls
    const filters = await page.$$('.filter-control');
    
    // Test each filter
    for (const filter of filters) {
      // Your custom test logic here
    }
  }
}
```

## Extending the Report

The HTML report can be customized to include additional metrics or visualizations:

1. Modify the `TestReportGenerator` class in `src/utils/test-report-generator.js`
2. Add new metrics collection in the test runner
3. Update the HTML template to display your custom metrics

## Support

If you encounter issues:
1. Check the console output for error messages
2. Review the log files in the logs directory
3. Verify that all paths and configurations are correct
4. Make sure all dependencies are installed

## License

This project is licensed under the MIT License.