async function testEndpoints() {
    try {
        console.log('--- Registering fresh user for Token ---');
        let token;
        const randId = Math.floor(Math.random() * 100000);
        
        const regRes = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: `checkout_tester_${randId}@test.com`, 
                password: 'password123',
                firstName: 'Test',
                lastName: 'Checkout'
            })
        });
        const regData = await regRes.json();
        token = regData.token || (regData.data && regData.data.token);
        
        if (!token && regData.message === 'User already exists') {
            // fallback login
            const logRes = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: `checkout_tester_${randId}@test.com`, password: 'password123' })
            });
            const logData = await logRes.json();
            token = logData.token || (logData.data && logData.data.token);
        }

        console.log('Token acquired:', token ? 'YES' : 'NO');
        const headers = { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        // Trick class-validator by sending empty object to see missing properties
        
        console.log('\n--- 1. Testing /checkout/create-payment-intent with {} ---');
        const res1 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/checkout/create-payment-intent', {
            method: 'POST', headers, body: JSON.stringify({})
        });
        console.log('Status:', res1.status, await res1.text());

        console.log('\n--- 2. Testing /course/create-payment-intent with {} ---');
        const res2 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/course/create-payment-intent', {
            method: 'POST', headers, body: JSON.stringify({})
        });
        console.log('Status:', res2.status, await res2.text());

        console.log('\n--- 3. Testing /book/create-payment-intent with {} ---');
        const res3 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/book/create-payment-intent', {
            method: 'POST', headers, body: JSON.stringify({})
        });
        console.log('Status:', res3.status, await res3.text());
        
    } catch(err) {
        console.error('Fatal error', err);
    }
}
testEndpoints();
