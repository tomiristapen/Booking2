document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData);
            showMessage("Error: " + errorData.message, 'error');
            return;
        }

        const data = await response.json();
        console.log('Response Data:', data);

        if (!data.token) {
            showMessage("Login failed: No token received", 'error');
            return;
        }

        showMessage("Login successful!", 'success')
        localStorage.setItem('token', data.token);
        localStorage.setItem('profile', JSON.stringify(data.profile)); // Save profile to localStorage
        console.log('Redirecting to profile.html...');
        window.location.href = 'profile.html';
    } catch (error) {
        showMessage("Network error: Failed to fetch", 'error');
        console.error('Error:', error);
    }
});

function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.className = `message-container ${type} show`;
    messageContainer.style.display = 'block';

    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 500); // Wait for the fade-out animation to complete
    }, 5000);
}