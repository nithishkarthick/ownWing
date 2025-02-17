// Signup form submission
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const userData = {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword
    };

    // Send POST request to signup endpoint
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Show success or error message
        if (data.message === 'Account created successfully!') {
            window.location.href = '/login';  // Redirect to login page after successful signup
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error during signup');
    });
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = { email, password };

    // Send POST request to login endpoint
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === 'Login successful') {
            window.location.href = '/profile';  // Redirect to profile page after successful login
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error during login');
    });
});

// Donor registration form submission
function submitDonorForm(event) {
    event.preventDefault();

    const donorData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        location: document.getElementById('location').value
    };

    fetch('/donor/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(donorData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Show success message
    })
    .catch(error => {
        console.error('Error registering donor:', error);
        alert('Error registering donor');
    });
}

// Donor search form submission
function searchDonors(event) {
    event.preventDefault();

    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const location = document.getElementById('searchLocation').value;

    fetch(`/donor/search?bloodGroup=${bloodGroup}&location=${location}`)
    .then(response => response.json())
    .then(data => {
        const searchResultsDiv = document.getElementById('searchResults');
        searchResultsDiv.innerHTML = '';  // Clear previous results

        if (data.length === 0) {
            searchResultsDiv.innerHTML = '<p>No donors found.</p>';
        } else {
            data.forEach(donor => {
                const donorDiv = document.createElement('div');
                donorDiv.innerHTML = `
                    <p>Name: ${donor.name}</p>
                    <p>Age: ${donor.age}</p>
                    <p>Blood Group: ${donor.blood_group}</p>
                    <p>Location: ${donor.location}</p>
                `;
                searchResultsDiv.appendChild(donorDiv);
            });
        }
    })
    .catch(error => {
        console.error('Error searching donors:', error);
        alert('Error fetching donors');
    });
}
