const aiHelpButtonURL = chrome.runtime.getURL("assets/aiHelpButton.png")

const observer = new MutationObserver(() => {
    addAiHelpButton();
    console.log("Trigerring");
})

observer.observe(document.body, {childList : true, subtree : true});

// addAiHelpButton();

function onProblemsPage() {
    const pathName = window.location.pathname;
    return pathName.startsWith('/problems/') && pathName.length > "/problems/".length;
}

function addAiHelpButton() {

    if(!onProblemsPage() || document.getElementById("aiHelpButton")) return;

    const aiHelpButton = document.createElement('button');
    aiHelpButton.id = "aiHelpButton";
    aiHelpButton.type = "button";
    aiHelpButton.style.cursor = 'pointer';
    aiHelpButton.className = "ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ coding_ai_help_button__Custom gap-1 py-2 px-3 overflow-hidden";
    aiHelpButton.style.height = "fit-content";

    // Adding the inner HTML for the button with a robot-style logo
    aiHelpButton.innerHTML = `
        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
            <!-- Robot head logo -->
            <rect x="6" y="8" width="12" height="8" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"></rect>
            <circle cx="9" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="12" r="1" fill="currentColor"></circle>
            <path d="M9 16h6" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M8 6h2v2H8zM14 6h2v2h-2z" fill="currentColor"></path>
            <line x1="6" y1="6" x2="8" y2="6" stroke-linecap="round" stroke-linejoin="round"></line>
            <line x1="16" y1="6" x2="18" y2="6" stroke-linecap="round" stroke-linejoin="round"></line>
        </svg>
        <span class="coding_ai_help_gradient_text__Custom">AI Help</span>
    `;

    // Find the "Ask Doubt" button and insert the new button after it
    const askDoubtButton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];
    if (askDoubtButton) {
        askDoubtButton.parentNode.insertAdjacentElement("afterend", aiHelpButton);
    }

    aiHelpButton.addEventListener("click", addaiHelperHandler);
}

function addaiHelperHandler() {
    // Check if chatbox already exists
    if (document.getElementById("aiChatbox")) {
        console.log("Chatbox already exists!");
        return;
    }

    // Create the chatbox container
    const chatboxContainer = document.createElement('div');
    chatboxContainer.id = "aiChatbox";
    chatboxContainer.style.position = "fixed";
    chatboxContainer.style.bottom = "20px";
    chatboxContainer.style.right = "20px";
    chatboxContainer.style.width = "300px";
    chatboxContainer.style.height = "400px";
    chatboxContainer.style.backgroundColor = "white";
    chatboxContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    chatboxContainer.style.borderRadius = "8px";
    chatboxContainer.style.display = "flex";
    chatboxContainer.style.flexDirection = "column";
    chatboxContainer.style.zIndex = "1000";

    // Create the header for the chatbox
    const chatboxHeader = document.createElement('div');
    chatboxHeader.style.backgroundColor = "#007BFF";
    chatboxHeader.style.color = "white";
    chatboxHeader.style.padding = "10px";
    chatboxHeader.style.borderTopLeftRadius = "8px";
    chatboxHeader.style.borderTopRightRadius = "8px";
    chatboxHeader.style.display = "flex";
    chatboxHeader.style.justifyContent = "space-between";
    chatboxHeader.style.alignItems = "center";

    chatboxHeader.innerHTML = `
        <span style="font-size: 16px; font-weight: bold;">AI Chat</span>
        <button id="closeChatbox" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">&times;</button>
    `;

    // Create the chatbox body
    const chatboxBody = document.createElement('div');
    chatboxBody.style.flex = "1";
    chatboxBody.style.overflowY = "auto";
    chatboxBody.style.padding = "10px";
    chatboxBody.style.borderTop = "1px solid #f1f1f1";

    // Create the input area
    const chatboxInputContainer = document.createElement('div');
    chatboxInputContainer.style.padding = "10px";
    chatboxInputContainer.style.borderTop = "1px solid #f1f1f1";

    const chatboxInput = document.createElement('input');
    chatboxInput.type = "text";
    chatboxInput.placeholder = "Type your message...";
    chatboxInput.style.width = "100%";
    chatboxInput.style.padding = "8px";
    chatboxInput.style.border = "1px solid #ccc";
    chatboxInput.style.borderRadius = "4px";

    // Append input to the input container
    chatboxInputContainer.appendChild(chatboxInput);

    // Append header, body, and input to the chatbox container
    chatboxContainer.appendChild(chatboxHeader);
    chatboxContainer.appendChild(chatboxBody);
    chatboxContainer.appendChild(chatboxInputContainer);

    // Append the chatbox container to the document body
    document.body.appendChild(chatboxContainer);

    // Event listener to close the chatbox
    document.getElementById("closeChatbox").addEventListener("click", () => {
        chatboxContainer.remove();
    });

    // Event listener to send messages
    chatboxInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && chatboxInput.value.trim()) {
            const message = chatboxInput.value.trim();
            chatboxInput.value = "";

            // Display the user's message in the chatbox
            const userMessage = document.createElement('div');
            userMessage.style.marginBottom = "10px";
            userMessage.style.padding = "10px";
            userMessage.style.backgroundColor = "#007BFF";
            userMessage.style.color = "white";
            userMessage.style.borderRadius = "8px";
            userMessage.style.alignSelf = "flex-end";
            userMessage.textContent = message;

            chatboxBody.appendChild(userMessage);

            // Call Gemini API and display the response
            fetchGeminiResponse(message).then((response) => {
                const botMessage = document.createElement('div');
                botMessage.style.marginBottom = "10px";
                botMessage.style.padding = "10px";
                botMessage.style.backgroundColor = "#f1f1f1";
                botMessage.style.borderRadius = "8px";
                botMessage.style.alignSelf = "flex-start";
                botMessage.textContent = response;

                chatboxBody.appendChild(botMessage);

                // Scroll to the bottom of the chatbox
                chatboxBody.scrollTop = chatboxBody.scrollHeight;
            });
        }
    });
}

// Function to fetch response from Gemini API
async function fetchGeminiResponse(message) {
    const apiKey = "AIzaSyApes88r557-1MqpTmYfg1rzqV5s1iu6ZI"; // Replace with your actual Gemini API key
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"; // Gemini API endpoint

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: message,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text.trim(); // Extracting the response text
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.error("Failed to fetch response:", error);
        return "Sorry, something went wrong. Please try again later.";
    }
}
