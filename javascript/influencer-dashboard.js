document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/influencers';

    const email = localStorage.getItem('loggedInUserEmail');
    const profileCard = document.getElementById('my-profile-card');
    const loadingSpinner = document.getElementById('profile-loading-spinner');
    const noProfileMessage = document.getElementById('no-profile-message');

    const modal = document.getElementById('influencer-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const editBtn = document.getElementById('edit-my-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const form = document.getElementById('influencer-form');
    const cancelFormBtn = document.getElementById('cancel-form-btn');

    const toastContainer = document.getElementById('toast-container');

    let currentInfluencer = null;

    function loadProfile() {
        fetch(`${apiUrl}?userEmail=${email}`)
            .then(res => res.json())
            .then(data => {
                loadingSpinner.style.display = 'none';
                if (data.length === 0) {
                    noProfileMessage.style.display = 'block';
                    return;
                }
                currentInfluencer = data[0];
                renderProfile(currentInfluencer);
            })
            .catch(err => {
                showToast('Error fetching profile.', true);
                console.error(err);
            });
    }

    function renderProfile(influencer) {
        profileCard.innerHTML = `
            <div class="profile-details">
                <h3>${influencer.name}</h3>
                <p><strong>Platform:</strong> ${influencer.platform}</p>
                <p><strong>Followers:</strong> ${influencer.followerCount}</p>
                <p><strong>Segment:</strong> ${influencer.segment}</p>
                <p><strong>Demographics:</strong><br>
                   Age: ${influencer.demographics.age || 'N/A'}<br>
                   Gender: ${influencer.demographics.gender || 'N/A'}<br>
                   Location: ${influencer.demographics.location || 'N/A'}</p>
                ${influencer.profilePicture ? `<img src="${influencer.profilePicture}" alt="Profile Picture" style="max-width:150px;">` : ''}
            </div>
        `;
    }

    editBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (currentInfluencer) {
            populateForm(currentInfluencer);
            modalTitle.textContent = 'Edit Influencer Profile';
        } else {
            form.reset();
            document.getElementById('user-email-hidden').value = email;
            modalTitle.textContent = 'Create Influencer Profile';
        }
    });

    function populateForm(data) {
        document.getElementById('influencer-id').value = data.id;
        document.getElementById('user-email-hidden').value = data.userEmail;
        document.getElementById('name').value = data.name || '';
        document.getElementById('platform').value = data.platform || '';
        document.getElementById('followerCount').value = data.followerCount || '';
        document.getElementById('segment').value = data.segment || '';
        document.getElementById('demographics-age').value = data.demographics.age || '';
        document.getElementById('demographics-gender').value = data.demographics.gender || '';
        document.getElementById('demographics-location').value = data.demographics.location || '';
        document.getElementById('profilePicture').value = data.profilePicture || '';
    }

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    cancelFormBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById('influencer-id').value;
        const influencerData = {
            userEmail: document.getElementById('user-email-hidden').value,
            name: document.getElementById('name').value.trim(),
            platform: document.getElementById('platform').value,
            followerCount: parseInt(document.getElementById('followerCount').value),
            segment: document.getElementById('segment').value.trim(),
            demographics: {
                age: document.getElementById('demographics-age').value.trim(),
                gender: document.getElementById('demographics-gender').value.trim(),
                location: document.getElementById('demographics-location').value.trim(),
            },
            profilePicture: document.getElementById('profilePicture').value.trim()
        };

        const url = id ? `${apiUrl}/${id}` : apiUrl;
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(influencerData)
        })
        .then(res => res.json())
        .then(data => {
            modal.classList.add('hidden');
            showToast('Profile saved successfully!');
            currentInfluencer = data;
            renderProfile(currentInfluencer);
            noProfileMessage.style.display = 'none';
        })
        .catch(err => {
            showToast('Error saving profile.', true);
            console.error(err);
        });
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserEmail');
        window.location.href = '../login/influencerLogin.html';
    });

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast-message ${isError ? 'toast-error' : 'toast-success'}`;
        toast.style.padding = '10px';
        toast.style.marginBottom = '10px';
        toast.style.borderRadius = '6px';
        toast.style.color = '#fff';
        toast.style.backgroundColor = isError ? '#dc2626' : '#16a34a';
        toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    if (!email) {
        window.location.href = '../login/influencerLogin.html';
    } else {
        loadProfile();
    }
});
