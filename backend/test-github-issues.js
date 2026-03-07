require('dotenv').config();
const axios = require('axios');

const GITHUB_PAT = process.env.GITHUB_PAT;

async function testGitHubIssues() {
  console.log('🔍 Testing GitHub Issues API for "integrationq" repository...\n');
  
  if (!GITHUB_PAT) {
    console.error('❌ GITHUB_PAT not found in .env file');
    console.log('\nPlease add your GitHub Personal Access Token to .env:');
    console.log('GITHUB_PAT=your_token_here\n');
    return;
  }
  
  console.log('✅ GitHub PAT found\n');
  
  try {
    // First, get the authenticated user to find the owner
    console.log('Step 1: Getting authenticated user...');
    console.log('─────────────────────────────────────────');
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    const username = userResponse.data.login;
    console.log(`✅ Authenticated as: ${username}\n`);
    
    // Try to get the integrationq repository
    console.log('Step 2: Checking for "integrationq" repository...');
    console.log('─────────────────────────────────────────');
    
    let owner = username;
    let repoName = 'integrationq';
    let repoFound = false;
    
    try {
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      console.log(`✅ Repository found: ${repoResponse.data.full_name}`);
      console.log(`   URL: ${repoResponse.data.html_url}`);
      console.log(`   Private: ${repoResponse.data.private}`);
      console.log(`   Has Issues: ${repoResponse.data.has_issues}\n`);
      repoFound = true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`ℹ️  Repository "${owner}/${repoName}" not found`);
        console.log('\nSearching for similar repositories...\n');
        
        // Search for repositories with similar names
        const searchResponse = await axios.get(
          'https://api.github.com/user/repos',
          {
            headers: {
              'Authorization': `token ${GITHUB_PAT}`,
              'Accept': 'application/vnd.github.v3+json',
            },
            params: {
              per_page: 100,
            },
          }
        );
        
        const matchingRepos = searchResponse.data.filter(repo => 
          repo.name.toLowerCase().includes('integration')
        );
        
        if (matchingRepos.length > 0) {
          console.log('Found repositories with "integration" in the name:');
          matchingRepos.forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.full_name}`);
            console.log(`   URL: ${repo.html_url}`);
            console.log(`   Has Issues: ${repo.has_issues}`);
            console.log('');
          });
          
          // Use the first matching repo
          const firstMatch = matchingRepos[0];
          [owner, repoName] = firstMatch.full_name.split('/');
          console.log(`Using repository: ${firstMatch.full_name}\n`);
          repoFound = true;
        } else {
          console.log('❌ No repositories found with "integration" in the name');
          return;
        }
      } else {
        throw error;
      }
    }
    
    if (!repoFound) {
      return;
    }
    
    // Get issues from the repository
    console.log(`Step 3: Fetching issues from ${owner}/${repoName}...`);
    console.log('─────────────────────────────────────────');
    
    const issuesResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/issues`,
      {
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params: {
          state: 'all',
          per_page: 10,
        },
      }
    );
    
    if (issuesResponse.data.length === 0) {
      console.log('ℹ️  No issues found in this repository');
      console.log('\nTo create a test issue, run:');
      console.log(`curl -X POST https://api.github.com/repos/${owner}/${repoName}/issues \\`);
      console.log(`  -H "Authorization: token YOUR_GITHUB_PAT" \\`);
      console.log(`  -H "Accept: application/vnd.github.v3+json" \\`);
      console.log(`  -d '{"title":"Test Issue","body":"This is a test issue for IntegrationIQ"}'`);
    } else {
      console.log(`✅ Found ${issuesResponse.data.length} issue(s):\n`);
      
      issuesResponse.data.forEach((issue, index) => {
        console.log(`${index + 1}. Issue #${issue.number}: ${issue.title}`);
        console.log(`   State: ${issue.state}`);
        console.log(`   URL: ${issue.html_url}`);
        console.log(`   Created: ${new Date(issue.created_at).toLocaleString()}`);
        console.log(`   Author: ${issue.user.login}`);
        if (issue.labels.length > 0) {
          console.log(`   Labels: ${issue.labels.map(l => l.name).join(', ')}`);
        }
        if (issue.body) {
          const bodyPreview = issue.body.substring(0, 100);
          console.log(`   Body: ${bodyPreview}${issue.body.length > 100 ? '...' : ''}`);
        }
        console.log('');
      });
      
      // Show example data structure
      console.log('Example Issue Data Structure:');
      console.log('─────────────────────────────────────────');
      const exampleIssue = issuesResponse.data[0];
      console.log(JSON.stringify({
        id: exampleIssue.id,
        number: exampleIssue.number,
        title: exampleIssue.title,
        state: exampleIssue.state,
        html_url: exampleIssue.html_url,
        created_at: exampleIssue.created_at,
        user: {
          login: exampleIssue.user.login,
          avatar_url: exampleIssue.user.avatar_url,
        },
        labels: exampleIssue.labels.map(l => ({ name: l.name, color: l.color })),
      }, null, 2));
    }
    
    console.log('\n✅ GitHub Issues API is working correctly!');
    console.log('\n📋 CURL Commands for Testing:');
    console.log('─────────────────────────────────────────');
    console.log('\n1. List all issues:');
    console.log(`curl -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     https://api.github.com/repos/${owner}/${repoName}/issues`);
    
    console.log('\n2. Get a specific issue (e.g., #1):');
    console.log(`curl -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     https://api.github.com/repos/${owner}/${repoName}/issues/1`);
    
    console.log('\n3. Create a new issue:');
    console.log(`curl -X POST https://api.github.com/repos/${owner}/${repoName}/issues \\`);
    console.log(`     -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     -d '{"title":"New Issue","body":"Issue description","labels":["bug"]}'`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      
      if (error.response.status === 401) {
        console.log('\n💡 Your GitHub token may be invalid or expired.');
        console.log('Generate a new token at: https://github.com/settings/tokens');
      }
    }
  }
}

testGitHubIssues();

// Made with Bob
