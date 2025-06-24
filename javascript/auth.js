document.addEventListener('DOMContentLoaded', () => {
    const currentPagePath = window.location.pathname;

    let userType = '';
    let isLoginForm = false;
    if (currentPagePath.includes('influencerLogin.html')) {
        userType = 'influencer';
        isLoginForm = true;
    } else if (currentPagePath.includes('influencerSignUp.html')) {
        userType = 'influencer';
        isLoginForm = false;
    } else if (currentPagePath.includes('companyLogin.html')) {
        userType = 'company';
        isLoginForm = true;
    } else if (currentPagePath.includes('companySignup.html')) {
        userType = 'company';
        isLoginForm = false;
    }
    const JSON_SERVER_BASE_URL = 'http://localhost:3000';
    const USER_ENDPOINT = userType === 'influencer' ? '/influencerUsers' : '/companyUsers';
    const AUTH_URL = `${JSON_SERVER_BASE_URL}${USER_ENDPOINT}`;

    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isLoginForm) {
                const email = document.getElementById(`${userType}-login-email`).value.trim();
                const password = document.getElementById(`${userType}-login-password`).value;

                try {
                    const response = await fetch(`${AUTH_URL}?email=${encodeURIComponent(email)}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const users = await response.json();
                    if (users.length > 0 && users[0].password === password) {
                        alert(`Login successful as ${userType}! Redirecting...`);
                        localStorage.setItem('loggedInUserEmail', email);
                        const dashboardPath = `/dashboard/${userType}Dashboard.html`;
                        window.location.href = dashboardPath;
                    } else {
                        alert('Login failed: Invalid email or password.');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    alert(`An error occurred during login: ${error.message}`);
                }

            } else {
                const email = document.getElementById(`${userType}-signup-email`).value.trim();
                const password = document.getElementById(`${userType}-signup-password`).value;
                const confirmPassword = document.getElementById(`${userType}-signup-confirm-password`).value;

                const isValidEmail = /\S+@\S+\.\S+/.test(email);
                if (!isValidEmail) return alert('Please enter a valid email address.');
                if (password.length < 6) return alert('Password must be at least 6 characters.');
                if (password !== confirmPassword) return alert('Passwords do not match.');

                let userData = { email, password };

                if (userType === 'influencer') {
                    const fullName = document.getElementById('influencer-signup-name').value.trim();
                    if (!fullName) return alert('Full Name is required.');
                    userData.fullName = fullName;
                } else {
                    const companyName = document.getElementById('company-signup-name').value.trim();
                    const contactPersonName = document.getElementById('company-signup-contact').value.trim();
                    if (!companyName || !contactPersonName) return alert('Company Name and Contact Person Name are required.');
                    userData.companyName = companyName;
                    userData.contactPersonName = contactPersonName;
                }

                try {
                    const checkEmail = await fetch(`${AUTH_URL}?email=${encodeURIComponent(email)}`);
                    const existingUsers = await checkEmail.json();

                    if (existingUsers.length > 0) {
                        alert('An account with this email already exists.');
                        return;
                    }

                    const response = await fetch(AUTH_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const newUser = await response.json();

                    alert(`Sign Up successful! Redirecting to ${userType} dashboard...`);
                    localStorage.setItem('loggedInUserEmail', newUser.email);
                    const dashboardPath = `/dashboard/${userType}Dashboard.html`;
                    window.location.href = dashboardPath;
                } catch (error) {
                    console.error('Signup error:', error);
                    alert(`An error occurred during sign up: ${error.message}`);
                }
            }
        });
    }
});
