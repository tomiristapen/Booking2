document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;
    const passwordRepeat = document.getElementById('psw-repeat').value;

    // Validate password match
    if (password !== passwordRepeat) {
        showMessage("Passwords do not match.", 'error');
        return;
    }

    const formData = {
        name: name,
        surname: surname,
        email: email,
        password: password
    };

    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage("Registration successful!", 'success');
            localStorage.setItem('profile', JSON.stringify(data.profile)); // Save profile to localStorage
            setTimeout(() => {
                window.location.href = 'profile.html'; // Redirect after a short delay
            }, 2000); // Redirect after 2 seconds
        } else {
            showMessage("Registration failed: " + data.message, 'error');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showMessage("There was an error with the registration.", 'error');
    });
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