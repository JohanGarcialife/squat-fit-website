async function run() {
    try {
        const randStr = Math.random().toString(36).substring(7);
        const userEmail = `testusr_${randStr}@test.com`;
        const userPass = 'TestPassword123!';

        console.log(`Registering new user: ${userEmail}`);
        
        await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: `tester_${randStr}`,
                email: userEmail, 
                password: userPass,
                firstName: 'Test',
                lastName: 'Checkout'
            })
        });

        // Try Login using { username: email } as discovered in frontend code
        console.log(`Logging in: ${userEmail}`);
        const logRes = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userEmail, password: userPass })
        });
        const logData = await logRes.json();
        const token = logData.token || (logData.data && logData.data.token);

        if (!token) {
            console.error('Login failed:', logData);
            return;
        }
        console.log('Token acquired successfully!');

        const headers = { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        const testUrls = [
            '/api/v1/checkout/create-payment-intent',
            '/api/v1/course/create-payment-intent',
            '/api/v1/book/create-payment-intent'
        ];

        for (const path of testUrls) {
            console.log(`\n--- Testing ${path} with empty body ---`);
            const res = await fetch(`https://squatfit-api-cyrc2g3zra-no.a.run.app${path}`, {
                method: 'POST', headers, body: JSON.stringify({})
            });
            console.log('Status:', res.status, await res.text());
        }

    } catch (e) {
        console.log(e);
    }
}
run();
