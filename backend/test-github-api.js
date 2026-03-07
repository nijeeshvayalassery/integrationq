require('dotenv').config();
const axios = require('axios');

const GITHUB_PAT = process.env.GITHUB_PAT;

async function testGitHubAPI() {
  console.log('🔍 Testing GitHub API Access...\n');
  
  if (!GITHUB_PAT) {
    console.error('❌ GITHUB_PAT not found in .env file');
    return;
  }
  
  console.log('✅ GitHub PAT found:', GITHUB_PAT.substring(0, 20) + '...\n');
  
  try {
    // Test 1: Get authenticated user
    console.log('Test 1: Get Authenticated User');
    console.log('─────────────────────────────────');
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    console.log('✅ Success!');
    console.log('Username:', userResponse.data.login);
    console.log('Name:', userResponse.data.name);
    console.log('Public Repos:', userResponse.data.public_repos);
    console.log('');
    
    // Test 2: List user's repositories
    console.log('Test 2: List Your Repositories');
    console.log('─────────────────────────────────');
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        per_page: 5,
      },
    });
    console.log('✅ Success!');
    console.log(`Found ${reposResponse.data.length} repositories (showing first 5):\n`);
    reposResponse.data.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.full_name}`);
      console.log(`   URL: ${repo.html_url}`);
      console.log(`   Private: ${repo.private}`);
      console.log('');
    });
    
    // Test 3: Get issues from first repo
    if (reposResponse.data.length > 0) {
      const firstRepo = reposResponse.data[0];
      const [owner, repo] = firstRepo.full_name.split('/');
      
      console.log(`Test 3: Get Issues from ${firstRepo.full_name}`);
      console.log('─────────────────────────────────');
      
      try {
        const issuesResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/issues`,
          {
            headers: {
              'Authorization': `token ${GITHUB_PAT}`,
              'Accept': 'application/vnd.github.v3+json',
            },
            params: {
              state: 'all',
              per_page: 5,
            },
          }
        );
        
        if (issuesResponse.data.length === 0) {
          console.log('ℹ️  No issues found in this repository');
        } else {
          console.log('✅ Success!');
          console.log(`Found ${issuesResponse.data.length} issues:\n`);
          issuesResponse.data.forEach((issue, index) => {
            console.log(`${index + 1}. #${issue.number}: ${issue.title}`);
            console.log(`   State: ${issue.state}`);
            console.log(`   URL: ${issue.html_url}`);
            console.log(`   Created: ${new Date(issue.created_at).toLocaleString()}`);
            console.log('');
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️  Issues are disabled for this repository');
        } else {
          throw error;
        }
      }
    }
    
    // Test 4: Rate limit info
    console.log('Test 4: Check Rate Limit');
    console.log('─────────────────────────────────');
    const rateLimitResponse = await axios.get('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    console.log('✅ Success!');
    console.log('Core API:');
    console.log(`  Limit: ${rateLimitResponse.data.resources.core.limit}`);
    console.log(`  Used: ${rateLimitResponse.data.resources.core.used}`);
    console.log(`  Remaining: ${rateLimitResponse.data.resources.core.remaining}`);
    console.log(`  Resets: ${new Date(rateLimitResponse.data.resources.core.reset * 1000).toLocaleString()}`);
    
    console.log('\n✅ All tests passed! GitHub API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    }
  }
}

testGitHubAPI();

// Made with Bob
