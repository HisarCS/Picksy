// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Add event listeners to keyboard keys
    initKeyboard();
    
    // Add event listeners to rating buttons
    initRatingButtons();
    
    // Simulate typing in the future
    setupMascotInteraction();
}

function initKeyboard() {
    const keys = document.querySelectorAll('.key');
    
    keys.forEach(key => {
        key.addEventListener('click', function() {
            // Get the key value
            const keyValue = this.textContent;
            
            // Show visual feedback
            this.classList.add('key-pressed');
            setTimeout(() => {
                this.classList.remove('key-pressed');
            }, 100);
            
            // Handle special keys
            if (keyValue === '⌫') {
                // Handle backspace
                console.log('Backspace pressed');
            } else if (keyValue === 'return') {
                // Handle return
                console.log('Return pressed');
                
                // Show mascot response (future chat implementation)
                showMascotResponse();
            } else if (keyValue === 'space') {
                // Handle space
                console.log('Space pressed');
            } else {
                // Regular key press - would add to input in a real implementation
                console.log('Key pressed:', keyValue);
            }
        });
    });
}

function initRatingButtons() {
    const thumbUp = document.querySelector('.thumb-up');
    const thumbDown = document.querySelector('.thumb-down');
    
    thumbUp.addEventListener('click', function() {
        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // Here we would handle the positive rating
        console.log('Thumbs up clicked');
    });
    
    thumbDown.addEventListener('click', function() {
        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // Here we would handle the negative rating
        console.log('Thumbs down clicked');
    });
}

function setupMascotInteraction() {
    const mascot = document.querySelector('.mascot');
    
    mascot.addEventListener('click', function() {
        // Animate mascot on click (simple bounce effect)
        this.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            this.style.transform = 'translateY(0)';
        }, 300);
        
        // Update chat bubble with a different message
        changeChatMessage("I'm Picksy! Click the keyboard to chat with me.");
    });
}

function showMascotResponse() {
    // This would eventually connect to the AI
    // For now, just change the chat bubble text
    changeChatMessage("I'm here to help! What would you like to know?");
    
    // Animate mascot reaction
    const mascot = document.querySelector('.mascot');
    mascot.style.transform = 'translateY(-5px)';
    setTimeout(() => {
        mascot.style.transform = 'translateY(0)';
    }, 200);
}

function changeChatMessage(message) {
    const chatBubble = document.querySelector('.chat-bubble p');
    
    // Fade out
    chatBubble.style.opacity = '0';
    
    // Change text and fade in
    setTimeout(() => {
        chatBubble.textContent = message;
        chatBubble.style.opacity = '1';
    }, 300);
}

// Note: Audio functionality will be added later
// This placeholder function shows where we'll integrate with the Pico
function initializeAudio() {
    console.log('Audio functionality will be implemented later');
    // This will handle communication with the Pico device
    // and update the waveform visualization
}