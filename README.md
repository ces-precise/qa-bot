# Complete Workflow Guide: Testing Shiny Dashboard and Generating Reports

This guide walks you through the complete process of setting up, running, and analyzing automated tests for your Shiny dashboard at https://sheetsolved.shinyapps.io/preciseSandboxAnalytics/

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional, for version control)

## Step 1: Project Setup

First, let's create a new project structure for our dashboard testing bot:

```bash
# Create project folder
mkdir shiny-dashboard-qa
cd shiny-dashboard-qa

# Create directory structure
mkdir -p src/{core,scenarios,utils} config examples logs/{reports,screenshots}

# Initialize npm project
npm init -y

# Install dependencies
npm install puppeteer fs-extra chart.js bootstrap
```

## Step 2: Install Key Components

Download and install the key files we've created:

1. Create the file structure as shown below:
```
shiny-dashboard-qa/
├── config/
│   └── shiny-config.js
├── examples/
│   ├── shiny-test-runner.js
│   └── report-integration.js
├── src/
│   ├── scenarios/
│   │   └── shiny-scenarios.js
│   └── utils/
│       ├── logger.js
│       └── report-generator.js
├── logs/
│   ├── reports/
│   └── screenshots/
├── package.json
└── README.md
```

2. Copy the provided code files into their respective locations.

## Step 3: Configure the Test

Edit the `config/shiny-config.js` file to match your specific dashboard requirements:

```javascript
// config/shiny-config.js
module.exports = {
  // Dashboard URL - update if needed
  baseUrl: 'https://sheetsolved.shinyapps.io/preciseSandboxAnalytics/',
  
  // Testing parameters
  concurrentUsers: 1,  // Shiny apps work best with one user at a time
  iterationsPerUser: 1,
  logDir: './logs',
  
  // Shiny-specific selectors
  shinySelectors: {
    loadingIndicator: '.shiny-busy',
    content: '.tab-content',
    controls: '.well, .sidebar',
    plots: '.shiny-plot-output, .plotly, .highcharts-container', 
    tables: '.dataTables_wrapper, .reactable',
    text: '.shiny-text-output'
  },
  
  // Debug settings
  debug: {
    verbose: true,
    saveScreenshots: true,
    logConsoleMessages: true
  }
};
```

## Step 4: Run Initial Test

Execute the test runner to perform the first test:

```bash
node examples/shiny-test-runner.js
```

This will:
1. Open a browser and navigate to your Shiny dashboard
2. Execute the test scenarios defined in `src/scenarios/shiny-scenarios.js`
3. Capture screenshots of various states
4. Log the results

## Step 5: Generate a Test Report

Generate a comprehensive HTML report from the test results:

```bash
node examples/report-integration.js
```

This will:
1. Process the logs from the previous test run
2. Analyze the performance metrics and errors
3. Generate an HTML report with charts and screenshots
4. Save the report to the `logs/reports` directory

## Step 6: Review and Analyze Results

Open the generated HTML report in your browser:

1. Navigate to the `logs/reports` directory
2. Open the most recent `test-report-[timestamp].html` file

The report provides:
- A summary of test results (passed/failed tests)
- Performance metrics (load time, response time)
- Screenshots of the dashboard during testing
- Error details and recommendations for improvement

## Step 7: Refine Tests as Needed

Based on the test results, you may want to refine your test scenarios:

1. Open `src/scenarios/shiny-scenarios.js`
2. Adjust selectors if elements weren't found
3. Add more specific tests for your dashboard's unique features
4. Modify timeout values if needed

For example, if your dashboard has specific input controls that weren't tested, add them to the scenarios.

## Step 8: Scheduled Testing

For ongoing quality assurance, set up scheduled tests:

### Option 1: Use cron jobs (Linux/Mac)

```bash
# Add to crontab to run daily at 1 AM
0 1 * * * cd /path/to/shiny-dashboard-qa && node examples/report-integration.js >> cron.log 2>&1
```

### Option 2: Use Task Scheduler (Windows)

Create a batch file (`run-test.bat`):
```batch
cd C:\path\to\shiny-dashboard-qa
node examples\report-integration.js
```

Then add it to Windows Task Scheduler.

## Step 9: Integrate with CI/CD (Optional)

If you update your Shiny dashboard regularly, integrate testing into your CI/CD pipeline:

### Example GitHub Actions workflow:

```yaml
name: Dashboard QA Test

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1' # Run weekly on Mondays

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Install dependencies
        run: npm ci
      - name: Run dashboard tests
        run: node examples/report-integration.js
      - name: Upload reports
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: logs/reports/
      - name: Upload screenshots
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: logs/screenshots/
```

## Step 10: Extend and Customize

As you become more familiar with the testing system, consider these extensions:

1. **Custom Metrics**: Add custom performance metrics specific to your dashboard
2. **Data Validation**: Add tests that verify the data displayed matches expected values
3. **User Flow Testing**: Create scenarios that mimic typical user journeys
4. **Accessibility Testing**: Add tests for WCAG compliance
5. **Email Notifications**: Set up email alerts for test failures

## Troubleshooting

### Common Issues

1. **Elements not found**: 
   - Check the selectors in your config and scenarios
   - Use the browser's dev tools to find correct selectors
   - Increase timeouts for slow-loading elements

2. **Timeouts**:
   - Shiny apps can be slow to initialize; increase timeout values
   - Check if your app is resource-intensive

3. **Test hangs**:
   - Check for infinite loading states in your Shiny app
   - Ensure error handlers are in place

4. **Screenshots not showing in report**:
   - Check paths in the report generator
   - Ensure screenshots directory has write permissions

## Best Practices

1. **Start simple**: Begin with basic navigation tests before adding complex interactions
2. **Test incrementally**: Add one test scenario at a time
3. **Maintain selectors**: Keep a separate file of selectors that might need updating
4. **Version control**: Keep your tests in a git repository
5. **Analyze trends**: Compare reports over time to spot performance degradation

By following this workflow, you'll have a robust system for testing your Shiny dashboard, identifying issues early, and maintaining high quality as your dashboard evolves.

## Debugging Common Issues

### 1. Module Not Found Errors

If you encounter "module not found" errors:

```
Error: Cannot find module 'some-module'
```

**Solution**: 
- Check that the file exists at the expected path
- Try using the module-compat.js helper: `const modulePath = moduleCompat.findModulePath('some-module')`
- Check for typos in import statements or file names

### 2. Method Not Found Errors

If you get errors like: 
```
TypeError: object.someMethod is not a function
```

**Solution**:
- Verify the class or object definition includes the method
- Check for typos in method names
- Add defensive null/undefined checks before calling methods
- Add fallback implementations

### 3. Stream Write After End Errors

```
Error: write after end
```

**Solution**:
- Always check `logStream.writable` before writing
- Use async/await with Promises when closing streams
- Use try/catch blocks around stream operations

### 4. Log File Issues

**Solution**:
- Ensure the logs directory exists
- Check file permissions
- Use absolute paths when possible

## Specific Solution Details

### 1. Fixed helpers.js

The main issue was that `createDefaultScenarios` was defined but not exported. We've:
- Added it to the exports at the bottom of the file
- Made sure the function is correctly defined

### 2. Fixed report-generator.js

This file had several issues:
- The TestReportGenerator class methods were not properly defined/exported
- Error handling was inadequate
- There was no fallback for missing imports
- We've added robust error checking with helpful logging

### 3. Fixed report-integration.js

The stream handling was problematic:
- The log stream was closed before all operations were complete
- We've added proper async/await handling for stream operations
- Added more defensive checks around stream writing
- Added fallback path resolution for finding modules

### 4. Added module-compat.js

This new helper module:
- Provides utility functions for safely importing modules
- Has fallback implementations for critical functions
- Includes robust path resolution for finding modules across directories

## Testing Your Changes

1. **Simple test**: Run a basic test to verify the integration:
   ```
   node examples/report-integration.js
   ```

2. **Debug logs**: Add temporary debug logging with:
   ```javascript
   console.log('DEBUG:', someVariable);
   ```

3. **Structure check**: Verify module loading by adding:
   ```javascript
   console.log('Modules available:', Object.keys(require('./report-generator')));
   ```

## Contact Support

If you continue to experience issues after implementing these fixes, please provide:

1. The complete error message and stack trace
2. Your directory structure (output of `find . -type f | grep .js`)
3. Node.js version (`node --version`)
4. Operating system details