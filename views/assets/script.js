document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Check if passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Make POST request to the server to signup
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, confirmPassword })
            });

            const result = await response.json();
            if (response.ok) {
                window.location.href = '/login'; // Redirect to login page on success
            } else {
                alert(result.message); // Show error message
            }
        });
    } else {
        console.error("Signup form not found.");
    }
});


document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    // Check if the response is JSON and handle accordingly
    try {
        const result = await response.json();

        if (response.ok) {
            // Redirect to home page on successful login
            window.location.href = '/home';
        } else {
            alert(result.message);  // Show error message from server
        }
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        alert('An unexpected error occurred. Please try again.');
    }
});

async function submitDonorForm(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const bloodGroup = document.getElementById('bloodGroup').value;
    const location = document.getElementById('location').value;

    const response = await fetch('/donor/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            age,
            gender,
            phone,
            dob,
            blood_group: bloodGroup, // Make sure the key matches the backend
            location
        })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Donor registered successfully!');
    } else {
        alert('Error: ' + result.message);
    }
}


// This function is responsible for performing the donor search
async function searchDonors(event) {
    event.preventDefault();

    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const location = document.getElementById('searchLocation').value;

    try {
        const response = await fetch('/donor/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bloodGroup, location })
        });

        if (!response.ok) {
            throw new Error('Error searching donors');
        }

        const data = await response.json();
        
        // Call function to display the search results
        displaySearchResults(data);
    } catch (error) {
        console.error('Error during donor search:', error);
        alert('Error occurred while searching for donors.');
    }
}

// This function handles displaying search results
// This function handles displaying search results
function displaySearchResults(donors) {
    const resultsContainer = document.getElementById('searchResults');
    
    // First, check if the donors data is an array and has elements
    if (!Array.isArray(donors) || donors.length === 0) {
        resultsContainer.innerHTML = 'No donors found.';
        return;
    }

    // Now that we know we have valid data, display the donors
    resultsContainer.innerHTML = '';
    donors.forEach(donor => {
        const donorDiv = document.createElement('div');
        donorDiv.classList.add('donor');
        
        // Format the date of birth into a readable format (YYYY-MM-DD)
        const formattedDob = formatDate(donor.dob);
        
        donorDiv.innerHTML = `
            <p><strong>Name:</strong> ${donor.name}</p>
            <p><strong>Age:</strong> ${donor.age}</p>
            <p><strong>Gender:</strong> ${donor.gender}</p>
            <p><strong>Phone:</strong> ${donor.phone}</p>
            <p><strong>Date of Birth:</strong> ${formattedDob}</p>
            <p><strong>Blood Group:</strong> ${donor.blood_group}</p>
            <p><strong>Location:</strong> ${donor.location}</p>
        `;
        resultsContainer.appendChild(donorDiv);
    });
}

// Helper function to format date (YYYY-MM-DD)
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; // Returns formatted date in YYYY-MM-DD format
}
