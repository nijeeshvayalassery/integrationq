require('dotenv').config();
const axios = require('axios');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

async function testSendGrid() {
  console.log('📧 Testing SendGrid API Integration...\n');
  
  if (!SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in .env file');
    console.log('\nPlease add your SendGrid API Key to .env:');
    console.log('SENDGRID_API_KEY=your_api_key_here\n');
    return;
  }
  
  console.log('✅ SendGrid API Key found:', SENDGRID_API_KEY.substring(0, 20) + '...\n');
  
  try {
    // Test 1: Verify API Key
    console.log('Test 1: Verify API Key');
    console.log('─────────────────────────────────────────');
    const verifyResponse = await axios.get(
      'https://api.sendgrid.com/v3/scopes',
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ API Key is valid!');
    console.log('Scopes:', verifyResponse.data.scopes.slice(0, 5).join(', '), '...\n');
    
    // Test 2: Get Account Details
    console.log('Test 2: Get Account Details');
    console.log('─────────────────────────────────────────');
    try {
      const userResponse = await axios.get(
        'https://api.sendgrid.com/v3/user/profile',
        {
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('✅ Account Details:');
      console.log('Email:', userResponse.data.email);
      console.log('Username:', userResponse.data.username);
      console.log('');
    } catch (error) {
      console.log('ℹ️  Could not fetch account details (may need additional permissions)\n');
    }
    
    // Test 3: Send Test Email
    console.log('Test 3: Send Test Email');
    console.log('─────────────────────────────────────────');
    console.log('⚠️  This will send a real email!\n');
    
    const emailData = {
      personalizations: [
        {
          to: [
            {
              email: 'test@example.com', // Change this to your email
              name: 'Test Recipient'
            }
          ],
          subject: 'Test Email from IntegrationIQ'
        }
      ],
      from: {
        email: 'noreply@integrationiq.com', // Must be verified in SendGrid
        name: 'IntegrationIQ'
      },
      content: [
        {
          type: 'text/plain',
          value: 'This is a test email sent from IntegrationIQ to verify SendGrid integration.'
        },
        {
          type: 'text/html',
          value: '<h1>Test Email</h1><p>This is a test email sent from <strong>IntegrationIQ</strong> to verify SendGrid integration.</p><p>If you received this, the integration is working correctly! ✅</p>'
        }
      ]
    };
    
    console.log('Email payload:');
    console.log(JSON.stringify(emailData, null, 2));
    console.log('\n⚠️  Skipping actual send to avoid spam. To send, uncomment the code below.\n');
    
    // Uncomment to actually send the email:
    /*
    const sendResponse = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      emailData,
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (sendResponse.status === 202) {
      console.log('✅ Email sent successfully!');
      console.log('Status:', sendResponse.status);
      console.log('Message ID:', sendResponse.headers['x-message-id']);
    }
    */
    
    console.log('✅ SendGrid API is configured correctly!\n');
    
    // Show CURL commands
    console.log('📋 CURL Commands for Testing SendGrid:');
    console.log('═════════════════════════════════════════\n');
    
    console.log('1. Verify API Key:');
    console.log('─────────────────────────────────────────');
    console.log('curl -X GET "https://api.sendgrid.com/v3/scopes" \\');
    console.log('  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \\');
    console.log('  -H "Content-Type: application/json"\n');
    
    console.log('2. Get Account Profile:');
    console.log('─────────────────────────────────────────');
    console.log('curl -X GET "https://api.sendgrid.com/v3/user/profile" \\');
    console.log('  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \\');
    console.log('  -H "Content-Type: application/json"\n');
    
    console.log('3. Send Test Email:');
    console.log('─────────────────────────────────────────');
    console.log('curl -X POST "https://api.sendgrid.com/v3/mail/send" \\');
    console.log('  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{');
    console.log('    "personalizations": [');
    console.log('      {');
    console.log('        "to": [{"email": "recipient@example.com"}],');
    console.log('        "subject": "Test Email from IntegrationIQ"');
    console.log('      }');
    console.log('    ],');
    console.log('    "from": {"email": "sender@yourdomain.com"},');
    console.log('    "content": [');
    console.log('      {');
    console.log('        "type": "text/html",');
    console.log('        "value": "<h1>Test Email</h1><p>This is a test!</p>"');
    console.log('      }');
    console.log('    ]');
    console.log('  }\'\n');
    
    console.log('4. Simple Email (Minimal):');
    console.log('─────────────────────────────────────────');
    console.log('curl -X POST "https://api.sendgrid.com/v3/mail/send" \\');
    console.log('  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{');
    console.log('    "personalizations": [{"to": [{"email": "test@example.com"}]}],');
    console.log('    "from": {"email": "noreply@yourdomain.com"},');
    console.log('    "subject": "Quick Test",');
    console.log('    "content": [{"type": "text/plain", "value": "Hello World!"}]');
    console.log('  }\'\n');
    
    console.log('5. Email with GitHub Issue Data:');
    console.log('─────────────────────────────────────────');
    console.log('curl -X POST "https://api.sendgrid.com/v3/mail/send" \\');
    console.log('  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{');
    console.log('    "personalizations": [{');
    console.log('      "to": [{"email": "developer@example.com"}],');
    console.log('      "subject": "New GitHub Issue: Bug in Login"');
    console.log('    }],');
    console.log('    "from": {"email": "github-bot@yourdomain.com"},');
    console.log('    "content": [{');
    console.log('      "type": "text/html",');
    console.log('      "value": "<h2>New Issue Created</h2><p><strong>Title:</strong> Bug in Login</p><p><strong>Number:</strong> #42</p><p><strong>State:</strong> open</p><p><strong>URL:</strong> <a href=\\"https://github.com/user/repo/issues/42\\">View Issue</a></p>"');
    console.log('    }]');
    console.log('  }\'\n');
    
    console.log('💡 Important Notes:');
    console.log('─────────────────────────────────────────');
    console.log('1. Replace YOUR_SENDGRID_API_KEY with your actual API key');
    console.log('2. Replace sender email with a verified sender in SendGrid');
    console.log('3. Replace recipient email with a valid email address');
    console.log('4. SendGrid returns 202 Accepted for successful sends');
    console.log('5. Check SendGrid Activity Feed for delivery status\n');
    
    console.log('🔗 Useful Links:');
    console.log('─────────────────────────────────────────');
    console.log('SendGrid Dashboard: https://app.sendgrid.com/');
    console.log('API Key Management: https://app.sendgrid.com/settings/api_keys');
    console.log('Sender Authentication: https://app.sendgrid.com/settings/sender_auth');
    console.log('Activity Feed: https://app.sendgrid.com/email_activity\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n💡 Your SendGrid API key may be invalid or expired.');
        console.log('Generate a new key at: https://app.sendgrid.com/settings/api_keys');
      } else if (error.response.status === 403) {
        console.log('\n💡 Your API key may not have the required permissions.');
        console.log('Ensure it has "Mail Send" permission.');
      }
    }
  }
}

testSendGrid();

// Made with Bob
