document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;
    const passwordRepeat = document.getElementById('psw-repeat').value;

    if (password !== passwordRepeat) {
        alert("Passwords do not match.");
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
            alert("Registration successful!");
            localStorage.setItem('profile', JSON.stringify(data.profile)); // Save profile to localStorage
            window.location.href = 'profile.html';
        } else {
            alert("Registration failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was an error with the registration.");
    });
});