import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// --- Configuration ---
const BASE_URL = 'https://www.bitrab.online/'; // <--- Change this to your website URL

// --- Custom Metrics ---
const pageLoadTime = new Trend('page_load_time');
const errorRate = new Rate('error_rate');
const successfulLogins = new Counter('successful_logins');

// --- Test Options ---
export const options = {
    // Total test duration: ~30 minutes (across all scenarios)
    scenarios: {
        // Scenario 1: Normal Load Test (~10 minutes)
        normal_load: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '2m', target: 15_000 }, // Ramp up
                { duration: '6m', target: 15_000 }, // Steady state
                { duration: '2m', target: 0 }   // Ramp down
            ],
            exec: 'authenticatedUserJourney',
            gracefulStop: '30s'
        },

        // Scenario 2: Stress Test (~10 minutes)
        // Gradually increases load to find performance limits
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
                { duration: '3m', target: 40_000 },  // Ramp up to higher load
                { duration: '5m', target: 40_000 },  // Sustain high load
                { duration: '2m', target: 0 }    // Ramp down
            ],
            exec: 'loginUser',
            gracefulStop: '30s',
            startTime: '10m30s' // Start after normal load test
        },

        // Scenario 3: Spike Test (~10 minutes)
        // Simulates sudden traffic surges
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 5,
            stages: [
                { duration: '2m', target: 5_000 },    // Normal load
                { duration: '30s', target: 50_000 },  // Quick ramp to spike
                { duration: '2m', target: 50_000 },   // Sustain spike
                { duration: '30s', target: 5_000 },   // Quick recovery
                { duration: '4m30s', target: 5_000 }, // Observe system recovery
            ],
            exec: 'mixedUserActions',
            gracefulStop: '30s',
            startTime: '21m' // Start after stress test
        }
    },
    thresholds: {
        'page_load_time': ['p(95)<3000'], // 95% of pages should load within 3s
        'error_rate': ['rate<0.05'],       // Error rate should be less than 5%
        'http_req_duration': ['p(95)<1500'] // 95% of requests should complete within 1.5s
    },
    // Cloud-specific configuration
    ext: {
        loadimpact: {
            name: 'bitrab.online Performance Test',
            description: 'Combined load, stress, and spike tests for bitrab.online',
            projectID: '${K6_CLOUD_PROJECT_ID}', // This will be replaced with the actual project ID
            // Distribution configuration
            distribution: {
                'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
                'amazon:fr:paris': { loadZone: 'amazon:fr:paris', percent: 50 }
            },
        }
    }
};

// --- Login Function (used across scenarios) ---
export function loginUser() {
    // Login cookies will be stored in this object
    let cookieJar = http.cookieJar();

    group('Login', function () {
        // First visit the login page (which is the index in this case)
        let response = http.get(`${BASE_URL}/index.html`, {
            tags: { name: 'login_page', type: 'static' }
        });

        check(response, {
            'login page status is 200': (r) => r.status === 200,
            'login form exists': (r) => r.body.includes('password') || r.body.includes('login')
        }) || errorRate.add(1);

        pageLoadTime.add(response.timings.duration);

        sleep(randomIntBetween(1, 2)); // Reduced think time for stress test

        // Now attempt login
        response = http.post(`${BASE_URL}/php/traitementIndex.php`, {
            password: 'nC_AJbc4Cmia_7S',
            'phone': '652347819',
        }, {
            tags: { name: 'login_request', type: 'auth' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Store the successful login status
        if (check(response, {
            'successful login': (r) => r.status === 200
        })) {
            successfulLogins.add(1);
        } else {
            errorRate.add(1);
        }

        sleep(randomIntBetween(1, 2)); // Reduced think time for stress test
    });

    return cookieJar;
}

// --- Authenticated User Journey (Normal Load Test) ---
export function authenticatedUserJourney() {
    // First login and get cookies
    loginUser();

    // Then visit authenticated dashboard page
    group('View Dashboard', function () {
        const response = http.get(`${BASE_URL}/home.php`, {
            tags: { name: 'dashboard_page', type: 'authenticated' }
        });

        check(response, {
            'dashboard page loaded': (r) => r.status === 200,
            'dashboard content exists': (r) => r.body.includes('Dashboard')
        }) || errorRate.add(1);

        pageLoadTime.add(response.timings.duration);

        sleep(randomIntBetween(3, 6)); // Normal user thinking time
    });

    // Visit profile page
    group('View Profile', function () {
        const response = http.get(`${BASE_URL}/users-profile.php`, {
            tags: { name: 'profile_page', type: 'authenticated' }
        });

        check(response, {
            'profile page loaded': (r) => r.status === 200 && r.body.includes('Profile')
        }) || errorRate.add(1);

        pageLoadTime.add(response.timings.duration);

        sleep(randomIntBetween(2, 5)); // Normal user thinking time
    });

    // Visit tasks page
    group('View Tasks', function () {
        const response = http.get(`${BASE_URL}/tasks.php`, {
            tags: { name: 'tasks_page', type: 'authenticated' }
        });

        check(response, {
            'tasks page loaded': (r) => r.status === 200 && r.body.includes('Tasks')
        }) || errorRate.add(1);

        pageLoadTime.add(response.timings.duration);

        sleep(randomIntBetween(3, 7)); // Normal user thinking time
    });
}

// --- Mixed User Actions (Spike Test) ---
export function mixedUserActions() {
    // Login first
    loginUser();

    // Randomly select one of the actions to perform
    // This creates more varied load pattern for the spike test
    const action = Math.floor(Math.random() * 3);

    switch (action) {
        case 0:
            // View dashboard
            group('Spike - Dashboard', function () {
                const response = http.get(`${BASE_URL}/home.php`, {
                    tags: { name: 'spike_dashboard', type: 'spike' }
                });

                check(response, {
                    'dashboard loaded during spike': (r) => r.status === 200
                }) || errorRate.add(1);

                pageLoadTime.add(response.timings.duration);

                sleep(randomIntBetween(1, 3)); // Shorter think time during spike
            });
            break;

        case 1:
            // View profile
            group('Spike - Profile', function () {
                const response = http.get(`${BASE_URL}/users-profile.php`, {
                    tags: { name: 'spike_profile', type: 'spike' }
                });

                check(response, {
                    'profile loaded during spike': (r) => r.status === 200
                }) || errorRate.add(1);

                pageLoadTime.add(response.timings.duration);

                sleep(randomIntBetween(1, 2)); // Shorter think time during spike
            });
            break;

        case 2:
            // View tasks
            group('Spike - Tasks', function () {
                const response = http.get(`${BASE_URL}/tasks.php`, {
                    tags: { name: 'spike_tasks', type: 'spike' }
                });

                check(response, {
                    'tasks loaded during spike': (r) => r.status === 200
                }) || errorRate.add(1);

                pageLoadTime.add(response.timings.duration);

                sleep(randomIntBetween(1, 2)); // Shorter think time during spike
            });
            break;
    }
} 