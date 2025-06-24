document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://localhost:3000/influencers';
    const logoutBtn = document.getElementById('logout-btn');
    const searchInput = document.getElementById('search-name');
    const platformFilter = document.getElementById('filter-platform');
    const segmentFilter = document.getElementById('filter-segment');
    const minFollowersInput = document.getElementById('min-followers');
    const resetBtn = document.getElementById('reset-filters-btn');
    const influencerList = document.getElementById('influencer-list');
    const spinner = document.getElementById('loading-spinner');
    const noResultsMsg = document.getElementById('no-influencers-message');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserEmail');
        window.location.href = '../login/companyLogin.html';
    });
    function renderInfluencers(data) {
        influencerList.innerHTML = '';
        if (data.length === 0) {
            noResultsMsg.style.display = 'block';
            return;
        }
        noResultsMsg.style.display = 'none';
        data.forEach(influencer => {
            const card = document.createElement('div');
            card.className = 'influencer-card';
            card.innerHTML = `
                ${influencer.profilePicture ? `<img src="${influencer.profilePicture}" alt="Profile Picture">` : ''}
                <h3>${influencer.name}</h3>
                <p><strong>Platform:</strong> ${influencer.platform}</p>
                <p><strong>Segment:</strong> ${influencer.segment}</p>
                <p><strong>Followers:</strong> ${influencer.followerCount}</p>
                <p><strong>Location:</strong> ${influencer.demographics?.location || 'N/A'}</p>
            `;
            influencerList.appendChild(card);
        });
    }
    function applyFilters(data) {
        const nameSearch = searchInput.value.toLowerCase();
        const platform = platformFilter.value;
        const segment = segmentFilter.value;
        const minFollowers = parseInt(minFollowersInput.value) || 0;

        return data.filter(influencer => {
            return (
                (!nameSearch || influencer.name.toLowerCase().includes(nameSearch)) &&
                (!platform || influencer.platform === platform) &&
                (!segment || influencer.segment === segment) &&
                (influencer.followerCount >= minFollowers)
            );
        });
    }
    async function fetchInfluencers() {
        spinner.style.display = 'block';
        try {
            const res = await fetch(BASE_URL);
            const data = await res.json();
            const filtered = applyFilters(data);
            renderInfluencers(filtered);
        } catch (err) {
            console.error('Error fetching influencers:', err);
        } finally {
            spinner.style.display = 'none';
        }
    }
    [searchInput, platformFilter, segmentFilter, minFollowersInput].forEach(input => {
        input.addEventListener('input', fetchInfluencers);
    });
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        platformFilter.value = '';
        segmentFilter.value = '';
        minFollowersInput.value = '';
        fetchInfluencers();
    });
    fetchInfluencers();
});
