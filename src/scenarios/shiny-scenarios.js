const { wait } = require('../utils/helpers');

// src/scenarios/shiny-scenarios.js
module.exports = {
    // Test sidebar menu navigation
    navigateTabs: {
      name: 'Navigate Dashboard Tabs',
      weight: 10,
      execute: async (page) => {
        // Wait for Shiny to fully load
        await page.waitForSelector('.tab-pane', { timeout: 10000 });
        
        // Get all tab links
        const tabLinks = await page.$$('.nav-item a');
        
        // Log found tabs
        console.log(`Found ${tabLinks.length} tabs`);
        
        // Click on each tab and verify content loads
        for (let i = 0; i < tabLinks.length; i++) {
          // Get tab name before clicking
          const tabName = await page.evaluate(el => el.textContent.trim(), tabLinks[i]);
          console.log(`Clicking tab: ${tabName}`);
          
          // Click the tab
          await tabLinks[i].click();
          
          // Wait for Shiny busy indicator to disappear (tab content loading)
          await page.waitForFunction(() => {
            const busy = document.querySelector('.shiny-busy');
            return !busy || busy.style.display === 'none';
          }, { timeout: 15000 });
          
          // Verify tab content is visible
          const content = await page.$('.tab-pane.active');
          if (!content) {
            throw new Error(`Content not found after clicking tab: ${tabName}`);
          }
          
          // Take screenshot of this tab
          await page.screenshot({ 
            path: `./logs/screenshots/tab-${tabName.replace(/\s+/g, '-').toLowerCase()}.png`,
            fullPage: true 
          });
          
          // Short delay between tab changes
          await wait(1000);
        }
      }
    },
    
    // Test dropdowns and input controls
    testInputControls: {
      name: 'Test Dashboard Input Controls',
      weight: 8,
      execute: async (page) => {
        // Wait for Shiny controls to be available
        await page.waitForSelector('.well', { timeout: 10000 });
        
        // Find all selectable inputs (dropdowns)
        const selectInputs = await page.$$('.selectize-input, select.form-control');
        
        // Test each dropdown
        for (let i = 0; i < selectInputs.length; i++) {
          try {
            console.log(`Testing select input ${i+1}/${selectInputs.length}`);
            
            // Click to open dropdown
            await selectInputs[i].click();
            await wait(500);
            
            // Look for dropdown options
            const options = await page.$$('.selectize-dropdown-content .option, select.form-control option');
            
            if (options.length > 0) {
              // Click a random option (not the first one)
              const randomIndex = Math.min(1, Math.floor(Math.random() * options.length));
              await options[randomIndex].click();
              
              // Wait for Shiny to process the change
              await page.waitForFunction(() => {
                const busy = document.querySelector('.shiny-busy');
                return !busy || busy.style.display === 'none';
              }, { timeout: 15000 });
              
              // Take a screenshot after selection
              await page.screenshot({ 
                path: `./logs/screenshots/select-input-${i+1}.png` 
              });
            }
          } catch (error) {
            console.log(`Error interacting with select input ${i+1}: ${error.message}`);
          }
          
          // Add delay between inputs
          await wait(1000);
        }
        
        // Find date range inputs if available
        const dateInputs = await page.$$('.shiny-date-input, .daterangepicker');
        if (dateInputs.length > 0) {
          console.log(`Found ${dateInputs.length} date inputs`);
          // Test date inputs - this would need customization based on your specific date picker
        }
        
        // Find and test slider inputs if available
        const sliders = await page.$$('.irs');
        for (let i = 0; i < sliders.length; i++) {
          try {
            console.log(`Testing slider ${i+1}/${sliders.length}`);
            
            // Get slider track
            const sliderBar = await sliders[i].$('.irs-line');
            if (sliderBar) {
              // Get bounding box of slider
              const box = await sliderBar.boundingBox();
              
              // Click at 75% position on the slider
              await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
              
              // Wait for Shiny to process the change
              await page.waitForFunction(() => {
                const busy = document.querySelector('.shiny-busy');
                return !busy || busy.style.display === 'none';
              }, { timeout: 15000 });
              
              // Take a screenshot
              await page.screenshot({ 
                path: `./logs/screenshots/slider-${i+1}.png` 
              });
            }
          } catch (error) {
            console.log(`Error interacting with slider ${i+1}: ${error.message}`);
          }
        }
      }
    },
    
    // Test data/plot interactions
    testPlotInteractions: {
      name: 'Test Dashboard Plot Interactions',
      weight: 6,
      execute: async (page) => {
        // Wait for plots to load
        await page.waitForSelector('.shiny-plot-output, .plotly, .highcharts-container', { 
          timeout: 15000 
        }).catch(() => console.log('No plots found'));
        
        // Find all plots
        const plots = await page.$$('.shiny-plot-output, .plotly, .highcharts-container');
        
        console.log(`Found ${plots.length} plots/visualizations`);
        
        // Interact with each plot
        for (let i = 0; i < plots.length; i++) {
          try {
            console.log(`Testing plot/visualization ${i+1}/${plots.length}`);
            
            // Get plot bounding box
            const box = await plots[i].boundingBox();
            
            // Take screenshot before interaction
            await page.screenshot({ 
              path: `./logs/screenshots/plot-${i+1}-before.png`,
              clip: {
                x: box.x - 10,
                y: box.y - 10,
                width: box.width + 20,
                height: box.height + 20
              }
            });
            
            // Hover over the plot at different positions to test tooltips
            const hoverPoints = [
              { x: 0.25, y: 0.5 },
              { x: 0.5, y: 0.5 },
              { x: 0.75, y: 0.5 }
            ];
            
            for (const point of hoverPoints) {
              // Move mouse to the point
              await page.mouse.move(
                box.x + box.width * point.x, 
                box.y + box.height * point.y
              );
              
              // Wait a bit for tooltip to appear
              await wait(500);
            }
            
            // Click on the plot
            await page.mouse.click(
              box.x + box.width * 0.5, 
              box.y + box.height * 0.5
            );
            
            // Wait for any reactions
            await wait(1000);
            
            // Take screenshot after interaction
            await page.screenshot({ 
              path: `./logs/screenshots/plot-${i+1}-after.png`,
              clip: {
                x: box.x - 10,
                y: box.y - 10,
                width: box.width + 20,
                height: box.height + 20
              }
            });
          } catch (error) {
            console.log(`Error interacting with plot ${i+1}: ${error.message}`);
          }
        }
        
        // Find all datatables
        const tables = await page.$$('.dataTables_wrapper, .reactable');
        
        console.log(`Found ${tables.length} data tables`);
        
        // Test table interactions
        for (let i = 0; i < tables.length; i++) {
          try {
            console.log(`Testing data table ${i+1}/${tables.length}`);
            
            // Find table headers (for sorting)
            const headers = await tables[i].$$('th');
            
            if (headers.length > 0) {
              // Click on a header to sort
              await headers[0].click();
              
              // Wait for Shiny to process
              await page.waitForFunction(() => {
                const busy = document.querySelector('.shiny-busy');
                return !busy || busy.style.display === 'none';
              }, { timeout: 15000 });
              
              // Take screenshot
              await page.screenshot({ 
                path: `./logs/screenshots/table-${i+1}-sorted.png` 
              });
            }
          } catch (error) {
            console.log(`Error interacting with table ${i+1}: ${error.message}`);
          }
        }
      }
    },
    
    // Test responsiveness
    testResponsiveness: {
      name: 'Test Dashboard Responsiveness',
      weight: 4,
      execute: async (page) => {
        // Original viewport size
        const originalViewport = page.viewport();
        
        // Test on different device sizes
        const viewports = [
          { width: 1920, height: 1080, name: 'Desktop Large' },
          { width: 1366, height: 768, name: 'Desktop Small' },
          { width: 768, height: 1024, name: 'Tablet Portrait' },
          { width: 375, height: 812, name: 'Mobile' }
        ];
        
        for (const viewport of viewports) {
          console.log(`Testing responsiveness at ${viewport.name} (${viewport.width}x${viewport.height})`);
          
          // Set viewport
          await page.setViewport({
            width: viewport.width,
            height: viewport.height
          });
          
          // Wait for layout to adjust
          await wait(1000);
          
          // Take screenshot
          await page.screenshot({
            path: `./logs/screenshots/responsive-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
            fullPage: true
          });
          
          // Check for horizontal scrollbar (potential responsive issue)
          const hasHorizontalScrollbar = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          
          if (hasHorizontalScrollbar) {
            console.log(`Warning: Horizontal scrollbar detected at ${viewport.name} size`);
          }
        }
        
        // Reset viewport
        await page.setViewport(originalViewport);
      }
    }
  };