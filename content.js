// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', initializeUI);

function initializeUI() {
  // Create and inject styles for both indicators
  const style = document.createElement('style');
  style.textContent = `
    .ai-task-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      transition: opacity 0.3s ease-in-out;
      opacity: 0;
      pointer-events: none;
    }

    .ai-task-indicator.visible {
      opacity: 1;
    }

    .ai-task-indicator .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: ai-task-spin 1s linear infinite;
    }

    @keyframes ai-task-spin {
      to { transform: rotate(360deg); }
    }

    .ai-task-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2147483646;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease-in-out;
    }

    .ai-task-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .ai-task-popup {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }

    .ai-task-popup .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      line-height: 1;
    }

    .ai-task-popup .close-button:hover {
      color: #000;
    }

    .ai-task-popup .content {
      white-space: pre-wrap;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      margin-bottom: 20px;
    }

    .ai-task-popup .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }

    .ai-task-popup button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      border: 1px solid #ddd;
    }

    .ai-task-popup .apply-button {
      background: #2196F3;
      color: white;
      border: none;
    }

    .ai-task-popup .apply-button:hover {
      background: #1976D2;
    }

    .ai-task-popup .cancel-button {
      background: white;
      color: #666;
    }

    .ai-task-popup .cancel-button:hover {
      background: #f5f5f5;
    }
  `;
  document.head.appendChild(style);

  // Create the loading indicator
  const indicator = document.createElement('div');
  indicator.className = 'ai-task-indicator';
  indicator.innerHTML = `
    <div class="spinner"></div>
    <span class="text">Executing task...</span>
  `;
  document.body.appendChild(indicator);

  // Create the overlay and popup
  const overlay = document.createElement('div');
  overlay.className = 'ai-task-overlay';
  overlay.innerHTML = `
    <div class="ai-task-popup">
      <button class="close-button">&times;</button>
      <div class="content"></div>
      <div class="buttons">
        <button class="cancel-button">Cancel</button>
        <button class="apply-button">Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Add close button functionality
  const closeButton = overlay.querySelector('.close-button');
  const cancelButton = overlay.querySelector('.cancel-button');
  const applyButton = overlay.querySelector('.apply-button');

  closeButton.addEventListener('click', hideOverlay);
  cancelButton.addEventListener('click', hideOverlay);
  applyButton.addEventListener('click', () => {
    if (window.taskUI.onApply) {
      window.taskUI.onApply();
    }
    hideOverlay();
  });

  // Close on overlay click (but not popup click)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideOverlay();
    }
  });

  // Make elements available globally
  window.taskUI = {
    indicator,
    overlay,
    popup: overlay.querySelector('.ai-task-popup'),
    content: overlay.querySelector('.content'),
    onApply: null // Will be set when showing the overlay
  };
}

// Function to show/hide the loading indicator
function showTaskIndicator(show, taskName = '') {
  // Ensure UI exists
  if (!window.taskUI) {
    initializeUI();
  }

  const indicator = window.taskUI.indicator;
  indicator.querySelector('.text').textContent = taskName ? 
    `Executing: ${taskName}` : 
    'Executing task...';
  
  if (show) {
    indicator.classList.add('visible');
  } else {
    indicator.classList.remove('visible');
  }
}

// Function to show the overlay with content and apply callback
function showOverlay(content, onApply) {
  // Ensure UI exists
  if (!window.taskUI) {
    initializeUI();
  }

  window.taskUI.content.textContent = content;
  window.taskUI.onApply = onApply;
  window.taskUI.overlay.classList.add('visible');
}

// Function to hide the overlay
function hideOverlay() {
  if (window.taskUI) {
    window.taskUI.overlay.classList.remove('visible');
    window.taskUI.onApply = null;
  }
}

// Handle task execution
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('onMessage', {request});

  if (request.action === 'executeTask') {
    executeTask(request.taskId);
  }
});

function executeTask(taskId) {
  console.log('executeTask', {taskId});

  chrome.storage.local.get('tasks', (result) => {
    const tasks = result.tasks || [];
    const task = tasks.find((t) => t.id === taskId);
    
    if (task) {
      console.log('Executing task:', task.name);
      
      // Show the loading indicator
      showTaskIndicator(true, task.name);

      // Simulate task execution
      setTimeout(() => {
        // Hide the loading indicator
        showTaskIndicator(false);
        
        // Show the result in the overlay with an apply callback
        const result = `Task Result for: ${task.name}\n\nThis is a simulated result for the task execution. Here you can display the AI response or any other task output.\n\nPrompt used: ${task.prompt}`;
        
        showOverlay(result, () => {
          console.log('Applying result:', result);
          // TODO: Implement the actual apply logic
        });
      }, 2000);
    }
  });
}
