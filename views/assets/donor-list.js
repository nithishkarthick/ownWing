// Function to fetch donor data and display it
function fetchDonorList() {
    fetch('http://localhost:3000/donors') // Make sure the URL is correct
        .then(response => {
            if (!response.ok) {
                // Log the error if the response is not OK (e.g., 500)
                throw new Error(`Error fetching donors: ${response.statusText}`);
            }
            return response.json(); // Parse the JSON response
        })
        .then(donors => {
            if (!Array.isArray(donors)) {
                throw new Error('Donors data is not an array.');
            }
            if (donors.length === 0) {
                document.getElementById('donorList').innerHTML = '<p>No donors registered yet.</p>';
            } else {
                // Generate the HTML content for the donor list
                let donorListHTML = '';
                donors.forEach(donor => {
                    donorListHTML += `
                        <div class="donor">
                            <h3>${donor.name}</h3>
                            <p><strong>Age:</strong> ${donor.age}</p>
                            <p><strong>Gender:</strong> ${donor.gender}</p>
                            <p><strong>Phone:</strong> ${donor.phone}</p>
                            <p><strong>Date of Birth:</strong> ${formatDate(donor.dob)}</p>
                            <p><strong>Blood Group:</strong> ${donor.blood_group}</p>
                            <p><strong>Location:</strong> ${donor.location}</p>
                        </div>
                    `;
                });

                // Insert the donor list HTML into the page
                document.getElementById('donorList').innerHTML = donorListHTML;
            }
        })
        .catch(error => {
            console.error('Error fetching donor data:', error);
            document.getElementById('donorList').innerHTML = '<p>Failed to load donor data. Please try again later.</p>';
        });
}

// Helper function to format date (YYYY-MM-DD)
function formatDate(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date'; // Return a default message for invalid date
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; // Returns formatted date in YYYY-MM-DD format
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchDonorList);
