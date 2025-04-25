// examples/shiny-test-runner.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Run tests on Shiny dashboard
 * @param {string} configFile - Path to config file
 */
async function runShinyTests(configFile) {
  console.log(`Starting Shiny dashboard tests...`);
  
  // Create helpers for waiting instead of waitForTimeout
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Default config
  let config = {
    baseUrl: 'https://sheetsolved.shinyapps.io/preciseSandboxAnalytics/',
    screenshotsDir: './logs/screenshots'
  };
  
  // Handle config as either direct object or a file path
  if (typeof configFile === 'string') {
    // It's a file path
    try {
      const configModule = require(configFile);
      config = { ...config, ...configModule };
    } catch (error) {
      console.warn(`Warning: Could not load config file ${configFile}. Using defaults.`);
    }
  } else if (typeof configFile === 'object') {
    // It's already an object, use it directly
    config = { ...config, ...configFile };
  }
  
  console.log(`Target URL: ${config.baseUrl}`);
    
    // Make sure screenshots directory exists
    const screenshotsDir = config.screenshotsDir || './logs/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    let browser;
    let testResults = {
      scenarios: [],
      startTime: new Date(),
      endTime: null,
      success: false
    };
    
    try {
      // Launch browser
      console.log('Launching browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the dashboard
      console.log('Opening dashboard...');
      await page.goto(config.baseUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      console.log('Waiting for Shiny initialization...');
      await wait(5000); // Give Shiny time to initialize
      
      // Take initial screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'initial-load.png'),
        fullPage: true 
      });
      
      // Execute test scenarios
      console.log("Running scenario: Tab Navigation");
      await runTabNavigationScenario(page, screenshotsDir, wait);
      console.log("Scenario \"Tab Navigation\" completed successfully");
      testResults.scenarios.push({ name: 'Tab Navigation', status: 'success' });
      
      console.log("Running scenario: Dashboard Controls");
      await runControlsScenario(page, screenshotsDir, wait);
      console.log("Scenario \"Dashboard Controls\" completed successfully");
      testResults.scenarios.push({ name: 'Dashboard Controls', status: 'success' });
      
      console.log("Running scenario: Responsiveness Test");
      await runResponsivenessScenario(page, screenshotsDir, wait);
      console.log("Scenario \"Responsiveness Test\" completed successfully");
      testResults.scenarios.push({ name: 'Responsiveness Test', status: 'success' });
      
      testResults.success = true;
    } catch (error) {
      console.error(`Test execution failed: ${error.message}`);
      testResults.error = error.message;
    } finally {
      if (browser) {
        await browser.close();
      }
      
      testResults.endTime = new Date();
      console.log(`Tests completed in ${testResults.endTime - testResults.startTime}ms`);
    }
    
    return testResults;
  }
  
/**
 * Tab Navigation Scenario
 */
async function runTabNavigationScenario(page, screenshotsDir, wait) {
  try {
    // Try to find navigation elements
    const navSelectors = [
      '.nav-tabs', 
      '.nav-pills', 
      '.sidebar-menu',
      '.sidebar .nav',
      '[role="tablist"]'
    ];
    
    let navElement = null;
    for (const selector of navSelectors) {
      navElement = await page.$(selector);
      if (navElement) {
        console.log(`Found navigation using selector: ${selector}`);
        break;
      }
    }
    
    if (!navElement) {
      console.log('Navigation elements not found, taking screenshot anyway');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'tab-navigation-not-found.png'),
        fullPage: true 
      });
      return;
    }
    
    // Find all tabs/nav items
    const tabSelectors = [
      '.nav-tabs .nav-item a', 
      '.nav-pills .nav-item a',
      '.sidebar-menu li a',
      '.sidebar .nav a',
      '[role="tab"]'
    ];
    
    let tabs = [];
    for (const selector of tabSelectors) {
      tabs = await page.$$(selector);
      if (tabs.length > 0) {
        console.log(`Found ${tabs.length} tabs using selector: ${selector}`);
        break;
      }
    }
    
    if (tabs.length === 0) {
      console.log('No tabs found, taking screenshot anyway');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'tabs-not-found.png'),
        fullPage: true 
      });
      return;
    }
    
    // Get tab names for logging
    const tabNames = await Promise.all(
      tabs.map(tab => page.evaluate(el => el.textContent.trim(), tab))
    );
    
    console.log(`Found tabs: ${tabNames.join(', ')}`);
    
    // Click on each tab (skip first tab that might be active)
    const tabsToClick = Math.min(tabs.length, 5);
    
    for (let i = 1; i < tabsToClick; i++) {
      console.log(`Clicking tab: ${tabNames[i]}`);
      
      // Click the tab
      await tabs[i].click();
      
      // Wait for content to update
      await wait(3000);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, `tab-${tabNames[i].toLowerCase().replace(/\s+/g, '-')}.png`),
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error(`Error in tab navigation: ${error.message}`);
    throw error;
  }
}

/**
 * Dashboard Controls Scenario
 */
async function runControlsScenario(page, screenshotsDir, wait) {
  try {
    // Common control container selectors
    const controlSelectors = [
      '.well', 
      '.sidebar-panel',
      '.control-panel',
      '.controls',
      '.sidebar .form-group',
      'form .form-group',
      '.shiny-input-container'
    ];
    
    let controls = [];
    for (const selector of controlSelectors) {
      controls = await page.$$(selector);
      if (controls.length > 0) {
        console.log(`Found ${controls.length} control containers using selector: ${selector}`);
        break;
      }
    }
    
    if (controls.length === 0) {
      console.log('No control containers found, taking screenshot anyway');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'controls-not-found.png'),
        fullPage: true 
      });
      return;
    }
    
    // Take screenshot of controls area
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'controls-initial.png'),
      fullPage: true 
    });
    
    // Try to find and interact with specific control types
    
    // 1. Try select/dropdown inputs
    const selectSelectors = [
      'select.form-control',
      '.selectize-input',
      '.dropdown-toggle',
      '.shiny-input-select'
    ];
    
    for (const selector of selectSelectors) {
      const selects = await page.$$(selector);
      if (selects.length > 0) {
        console.log(`Found ${selects.length} select controls with selector: ${selector}`);
        
        // Interact with the first select
        await selects[0].click();
        await wait(1000);
        
        // Try to find and click an option
        const optionSelectors = [
          '.selectize-dropdown-content .option', 
          '.dropdown-menu .dropdown-item',
          'option'
        ];
        
        let optionFound = false;
        for (const optSelector of optionSelectors) {
          const options = await page.$$(optSelector);
          if (options.length > 0) {
            console.log(`Found ${options.length} options with selector: ${optSelector}`);
            
            // Click on the second option (index 1) if available, otherwise the first
            const optionIndex = options.length > 1 ? 1 : 0;
            await options[optionIndex].click();
            optionFound = true;
            
            console.log('Selected an option from dropdown');
            await wait(5000);
            
            // Take screenshot after selection
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'controls-select-after.png'),
              fullPage: true 
            });
            
            break;
          }
        }
        
        if (!optionFound) {
          console.log('Could not find any dropdown options');
        }
        
        break;  // Only interact with one select control
      }
    }
    
    // 2. Try date inputs
    const dateInputs = await page.$$('.shiny-date-input, input[type="date"]');
    if (dateInputs.length > 0) {
      console.log(`Found ${dateInputs.length} date inputs`);
      
      // Click on the date input
      await dateInputs[0].click();
      await wait(1000);
      
      // Try to find and click a date
      const dateSelectors = [
        '.datepicker .day:not(.disabled)',
        '.bootstrap-datepicker .day:not(.disabled)',
        '.daterangepicker .available'
      ];
      
      for (const dateSelector of dateSelectors) {
        const dates = await page.$$(dateSelector);
        if (dates.length > 0) {
          await dates[Math.floor(dates.length / 2)].click();
          console.log('Selected a date');
          await wait(5000);
          
          // Take screenshot after date selection
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'controls-date-after.png'),
            fullPage: true 
          });
          
          break;
        }
      }
    }
    
    // 3. Try sliders
    const sliders = await page.$$('.irs, .slider, .noUi-target');
    if (sliders.length > 0) {
      console.log(`Found ${sliders.length} sliders`);
      
      // For each slider try to click at 75% position
      for (let i = 0; i < Math.min(sliders.length, 2); i++) {
        const boundingBox = await sliders[i].boundingBox();
        if (boundingBox) {
          // Click at 75% of slider width
          const clickX = boundingBox.x + boundingBox.width * 0.75;
          const clickY = boundingBox.y + boundingBox.height / 2;
          
          await page.mouse.click(clickX, clickY);
          console.log(`Clicked on slider ${i+1} at 75% position`);
          await wait(5000);
          
          // Take screenshot after slider interaction
          await page.screenshot({ 
            path: path.join(screenshotsDir, `controls-slider-${i+1}.png`),
            fullPage: true 
          });
        }
      }
    }
    
  } catch (error) {
    console.error(`Error in controls testing: ${error.message}`);
    throw error;
  }
}

/**
 * Responsiveness Scenario
 */
async function runResponsivenessScenario(page, screenshotsDir, wait) {
  try {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Small' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 812, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Set viewport size
      await page.setViewport({
        width: viewport.width,
        height: viewport.height
      });
      
      // Wait for layout to adjust
      await wait(5000);
      
      // Take screenshot
      await page.screenshot({ 
        path: path.join(screenshotsDir, `responsive-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`),
        fullPage: true 
      });
      
      // Check for mobile menu button at smaller sizes
      if (viewport.width < 768) {
        const mobileMenuSelectors = [
          '.navbar-toggler',
          '.hamburger-menu',
          '#mobile-menu-button',
          '.mobile-toggle',
          '.navbar-toggle'
        ];
        
        for (const selector of mobileMenuSelectors) {
          const mobileMenu = await page.$(selector);
          if (mobileMenu) {
            console.log(`Found mobile menu button with selector: ${selector}`);
            
            // Click the mobile menu button
            await mobileMenu.click();
            console.log('Clicked mobile menu button');
            await wait(1000);
            
            // Take screenshot with menu open
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'responsive-mobile-menu-open.png'),
              fullPage: true 
            });
            
            // Close the menu by clicking again
            await mobileMenu.click();
            await wait(1000);
            
            break;
          }
        }
      }
    }
    
    // Return to normal viewport
    await page.setViewport({ width: 1280, height: 800 });
    
  } catch (error) {
    console.error(`Error in responsiveness testing: ${error.message}`);
    throw error;
  }
}

module.exports = {
  runShinyTests
};