document.addEventListener('DOMContentLoaded', function () {
    // Fetch user profile data when the page loads
    fetch('/api/profile')
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                displayProfile(data);
                localStorage.setItem('profile', JSON.stringify(data));
            }
        })
        .catch(error => console.error('Error fetching profile:', error));

    document.getElementById('edit-profile-btn').addEventListener('click', function () {
        document.querySelector('.profile-container').style.display = 'none';
        document.querySelector('.edit-profile-container').style.display = 'block';

        const profile = JSON.parse(localStorage.getItem('profile'));
        document.getElementById('edit-name').value = profile.name;
        document.getElementById('edit-surname').value = profile.surname;
        document.getElementById('edit-email').value = profile.email;
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', function () {
        document.querySelector('.edit-profile-container').style.display = 'none';
        document.querySelector('.profile-container').style.display = 'block';
    });

    document.getElementById('edit-profile-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const updatedProfile = {
            name: document.getElementById('edit-name').value,
            surname: document.getElementById('edit-surname').value,
            email: document.getElementById('edit-email').value,
        };

        fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProfile),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Profile updated successfully') {
                    alert('Profile updated successfully');
                    localStorage.setItem('profile', JSON.stringify(updatedProfile));
                    displayProfile(updatedProfile);
                    document.querySelector('.edit-profile-container').style.display = 'none';
                    document.querySelector('.profile-container').style.display = 'block';
                } else {
                    alert('Error updating profile');
                }
            })
            .catch(error => console.error('Error updating profile:', error));
    });
});

function displayProfile(profile) {
    document.getElementById('profile-name').textContent = `Name: ${profile.name}`;
    document.getElementById('profile-surname').textContent = `Surname: ${profile.surname}`;
    document.getElementById('profile-email').textContent = `Email: ${profile.email}`;

    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = '';
    profile.tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.textContent = ticket;
        li.classList.add('list-group-item');
        ticketList.appendChild(li);
    });
}