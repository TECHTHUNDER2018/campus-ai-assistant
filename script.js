document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const chatMessages = document.getElementById('chat-messages');
    const langBtns = document.querySelectorAll('.lang-btn');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle');
    const chatbotPopup = document.getElementById('chatbot-popup');

    let currentLanguage = 'en-US'; // Default language

    // --- Chatbot Toggle Logic ---
    chatbotToggleBtn.addEventListener('click', () => {
        chatbotPopup.classList.toggle('show');
    });

    // --- Language Selector ---
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.getAttribute('data-lang');
            // Optional: Send a language change message to the bot
            // addMessageToChat('bot', `Language switched to ${btn.textContent}.`);
        });
    });

    // --- Relevant Notification ---
    function showWelcomeMessage() {
        addMessageToChat('bot', "Hello! I am the Campus AI Assistant. How can I help you today?");
        setTimeout(() => {
            addMessageToChat('bot', "🔔 **Event Notification:** The 'Mid-Term Prep Workshop Series' for all first-year students is happening next week, from Oct 6th to Oct 8th. Check the college portal for the full schedule!");
        }, 1000);
    }

    async function getAIResponse(input) {
        addTypingIndicator();
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, language: currentLanguage }),
            });
            if (!response.ok) throw new Error('Network response failed');
            const data = await response.json();
            
            // --- Ticket Raising Feature ---
            if (data.reply.toLowerCase().includes("ticket") && data.reply.toLowerCase().includes("created")) {
                const ticketId = Math.floor(10000 + Math.random() * 90000);
                return `${data.reply} Your ticket number is #${ticketId}. The support team will contact you shortly.`;
            }
            return data.reply;
        } catch (error) {
            console.error("Error fetching AI response:", error);
            return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
        } finally {
            removeTypingIndicator();
        }
    }
    
    // --- Voice-to-Text (Speech Recognition) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        
        micBtn.addEventListener('click', () => {
            recognition.lang = currentLanguage;
            recognition.start();
        });

        recognition.onstart = () => { userInput.placeholder = "Listening..."; };
        recognition.onend = () => { userInput.placeholder = "Type or use mic..."; };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            setTimeout(handleSendMessage, 500); // Automatically send after transcription
        };
    } else {
        micBtn.style.display = 'none'; // Hide mic if not supported
    }

    // --- Helper Functions to manage UI ---
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const messageTextSpan = document.createElement('span');
        messageTextSpan.innerHTML = message;
        messageElement.appendChild(messageTextSpan);

        if (sender === 'bot') {
            const speakIcon = document.createElement('span');
            speakIcon.classList.add('speak-icon');
            speakIcon.innerHTML = '🔊';
            speakIcon.title = 'Listen';
            messageElement.appendChild(speakIcon);
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }

    function addTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.innerHTML = '<span>●</span><span>●</span><span>●</span>'; // Animated dots
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingElement = document.querySelector('.typing-indicator');
        if (typingElement) typingElement.remove();
    }

    // --- Text-to-Speech ---
    chatMessages.addEventListener('click', function(event) {
        if (event.target.classList.contains('speak-icon')) {
            const messageText = event.target.parentElement.querySelector('span:first-child').textContent;
            const utterance = new SpeechSynthesisUtterance(messageText);
            utterance.lang = currentLanguage; // Use selected language for speech
            window.speechSynthesis.speak(utterance);
        }
    });

    async function handleSendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;
        addMessageToChat('user', userText);
        userInput.value = '';
        const aiText = await getAIResponse(userText);
        addMessageToChat('bot', aiText);
    }

    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSendMessage(); });
    
    showWelcomeMessage(); // Show welcome when the page loads


    // --- NEW: Scroll Animations ---
    const animateElements = document.querySelectorAll('[class*="animate-"]');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is in view
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });
});