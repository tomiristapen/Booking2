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
            alert('Error: ' + errorData.message);
            return;
        }

        const data = await response.json();
        console.log('Response Data:', data);

        if (!data.token) {
            alert('Login failed: No token received');
            return;
        }

        alert('Login successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('profile', JSON.stringify(data.profile)); // Save profile to localStorage
        console.log('Redirecting to profile.html...');
        window.location.href = 'profile.html';
    } catch (error) {
        alert('Network error: Failed to fetch');
        console.error('Error:', error);
    }
});