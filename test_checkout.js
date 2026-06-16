async function testEndpoints() {
    try {
        console.log('--- Logging in ---');
        let token;
        try {
            const loginRes = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@admin.com', password: 'password123' })
            });
            const data = await loginRes.json();
            token = data.token || (data.data && data.data.token);
        } catch (e) {
            console.log('Admin login failed, trying test user');
            const loginRes2 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
            });
            const data2 = await loginRes2.json();
            token = data2.token || (data2.data && data2.data.token);
        }

        console.log('Token acquired:', token ? 'YES' : 'NO');
        const headers = { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        console.log('\n--- Testing Unified Checkout with hardcoded string ---');
        const res1 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/checkout/create-payment-intent', {
            method: 'POST',
            headers,
            body: JSON.stringify({ items: [{ type: 'version', id: 'book-vol-1', quantity: 1 }] })
        });
        console.log('Status:', res1.status, await res1.text());

        console.log('\n--- Testing Unified Checkout with Real Version UUID ---');
        const res2 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/checkout/create-payment-intent', {
            method: 'POST',
            headers,
            body: JSON.stringify({ items: [{ type: 'version', id: 'fff42a02-ce53-4fed-9be4-6e9fcccd51a4', quantity: 1 }] })
        });
        console.log('Status:', res2.status, await res2.text());

        console.log('\n--- Testing Unified Checkout with Real Pack UUID ---');
        const res2b = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/checkout/create-payment-intent', {
            method: 'POST',
            headers,
            body: JSON.stringify({ items: [{ type: 'pack', id: 'ddaf92ab-702b-4eca-8937-ad32a0b12baf', quantity: 1 }] })
        });
        console.log('Status:', res2b.status, await res2b.text());

        console.log('\n--- Testing Course Subscription Checkout with course_id ---');
        const res3 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/course/create-payment-intent', {
            method: 'POST',
            headers,
            body: JSON.stringify({ course_id: '768ca513-4955-4168-a74d-78d1adc7e0a3', type: 'annual' })
        });
        console.log('Status:', res3.status, await res3.text());
        
        console.log('\n--- Testing Digital Book Subscription Checkout ---');
        const res4 = await fetch('https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/book/create-payment-intent', {
            method: 'POST',
            headers,
            body: JSON.stringify({ plan_type: 'annual' })
        });
        console.log('Status:', res4.status, await res4.text());
        
    } catch(err) {
        console.error('Fatal error', err);
    }
}
testEndpoints();
