// Fetch all donors from the backend when the page loads
window.onload = function() {
    fetch('/donors')
        .then(response => response.json())
        .then(data => {
            const donorListContainer = document.getElementById('donorList');
            if (data.length === 0) {
                donorListContainer.innerHTML = '<p>No donors registered yet.</p>';
            } else {
                // Loop through the data and display donor information
                const donorListHtml = data.map(donor => {
                    return `
                        <div class="donor-item">
                            <p><strong>Name:</strong> ${donor.name}</p>
                            <p><strong>Age:</strong> ${donor.age}</p>
                            <p><strong>Gender:</strong> ${donor.gender}</p>
                            <p><strong>Phone:</strong> ${donor.phone}</p>
                            <p><strong>Date of Birth:</strong> ${donor.dob}</p>
                            <p><strong>Blood Group:</strong> ${donor.blood_group}</p>
                            <p><strong>Location:</strong> ${donor.location}</p>
                        </div>
                        <hr>
                    `;
                }).join('');
                donorListContainer.innerHTML = donorListHtml;
            }
        })
        .catch(error => {
            console.error('Error fetching donors:', error);
            alert('There was an error fetching the donor list.');
        });
};