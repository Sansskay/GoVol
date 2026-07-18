// === AI Widget ===
const aiToggle = document.getElementById('ai-toggle');
const aiChat = document.getElementById('ai-chat');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiMessages = document.getElementById('ai-messages');

aiToggle.addEventListener('click', () => aiChat.classList.toggle('hidden'));
aiClose.addEventListener('click', () => aiChat.classList.add('hidden'));

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `ai-message ${sender}`;
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

async function sendAiMessage() {
    const text = aiInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    aiInput.value = '';

    addMessage('Печатает...', 'bot');

    try {
        const response = await fetch('http://localhost:3000/api/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: text })
        });
        const data = await response.json();
        
        aiMessages.lastChild.remove(); // убираем "Печатает..."
        addMessage(data.reply, 'bot');
    } catch (error) {
        aiMessages.lastChild.remove();
        addMessage('Не удалось связаться с сервером 😞', 'bot');
    }
}

aiSend.addEventListener('click', sendAiMessage);
aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAiMessage();
});

function scrollToActivities() {
    document.getElementById('activities').scrollIntoView({ behavior: 'smooth' });
}