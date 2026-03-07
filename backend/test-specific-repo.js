require('dotenv').config();
const axios = require('axios');

const GITHUB_PAT = process.env.GITHUB_PAT;
const OWNER = 'nijeeshvayalassery';
const REPO = 'integrationq';

async function testSpecificRepo() {
  console.log(`🔍 Testing GitHub Issues API for ${OWNER}/${REPO}...\n`);
  
  if (!GITHUB_PAT) {
    console.error('❌ GITHUB_PAT not found in .env file');
    return;
  }
  
  console.log('✅ GitHub PAT found\n');
  
  try {
    // Test 1: Get repository info
    console.log('Test 1: Repository Information');
    console.log('─────────────────────────────────────────');
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${OWNER}/${REPO}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ-Test',
        },
      }
    );
    console.log(`✅ Repository: ${repoResponse.data.full_name}`);
    console.log(`   URL: ${repoResponse.data.html_url}`);
    console.log(`   Private: ${repoResponse.data.private}`);
    console.log(`   Has Issues: ${repoResponse.data.has_issues}`);
    console.log(`   Open Issues: ${repoResponse.data.open_issues_count}\n`);
    
    // Test 2: Get ALL issues (open + closed)
    console.log('Test 2: Fetching ALL Issues (open + closed)');
    console.log('─────────────────────────────────────────');
    const allIssuesResponse = await axios.get(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
      {
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ-Test',
        },
        params: {
          state: 'all',
          per_page: 100,
        },
      }
    );
    
    console.log(`✅ Total issues found: ${allIssuesResponse.data.length}\n`);
    
    if (allIssuesResponse.data.length === 0) {
      console.log('ℹ️  No issues found in this repository');
    } else {
      // Separate open and closed issues
      const openIssues = allIssuesResponse.data.filter(i => i.state === 'open');
      const closedIssues = allIssuesResponse.data.filter(i => i.state === 'closed');
      
      console.log(`📊 Summary:`);
      console.log(`   Open: ${openIssues.length}`);
      console.log(`   Closed: ${closedIssues.length}\n`);
      
      // Display open issues
      if (openIssues.length > 0) {
        console.log('🟢 OPEN ISSUES:');
        console.log('─────────────────────────────────────────');
        openIssues.forEach((issue, index) => {
          console.log(`${index + 1}. Issue #${issue.number}: ${issue.title}`);
          console.log(`   State: ${issue.state}`);
          console.log(`   URL: ${issue.html_url}`);
          console.log(`   Created: ${new Date(issue.created_at).toLocaleString()}`);
          console.log(`   Author: ${issue.user.login}`);
          if (issue.labels.length > 0) {
            console.log(`   Labels: ${issue.labels.map(l => l.name).join(', ')}`);
          }
          if (issue.body) {
            const bodyPreview = issue.body.substring(0, 150);
            console.log(`   Body: ${bodyPreview}${issue.body.length > 150 ? '...' : ''}`);
          }
          console.log('');
        });
      }
      
      // Display closed issues
      if (closedIssues.length > 0) {
        console.log('🔴 CLOSED ISSUES:');
        console.log('─────────────────────────────────────────');
        closedIssues.forEach((issue, index) => {
          console.log(`${index + 1}. Issue #${issue.number}: ${issue.title}`);
          console.log(`   State: ${issue.state}`);
          console.log(`   URL: ${issue.html_url}`);
          console.log(`   Closed: ${new Date(issue.closed_at).toLocaleString()}`);
          console.log('');
        });
      }
      
      // Show detailed data for first open issue
      if (openIssues.length > 0) {
        console.log('\n📋 Detailed Data for First Open Issue:');
        console.log('─────────────────────────────────────────');
        const firstIssue = openIssues[0];
        console.log(JSON.stringify({
          id: firstIssue.id,
          number: firstIssue.number,
          title: firstIssue.title,
          state: firstIssue.state,
          html_url: firstIssue.html_url,
          created_at: firstIssue.created_at,
          updated_at: firstIssue.updated_at,
          user: {
            login: firstIssue.user.login,
            avatar_url: firstIssue.user.avatar_url,
          },
          labels: firstIssue.labels.map(l => ({ name: l.name, color: l.color })),
          body: firstIssue.body,
        }, null, 2));
      }
    }
    
    // Test 3: Get only OPEN issues
    console.log('\n\nTest 3: Fetching OPEN Issues Only');
    console.log('─────────────────────────────────────────');
    const openIssuesResponse = await axios.get(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
      {
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ-Test',
        },
        params: {
          state: 'open',
          per_page: 100,
        },
      }
    );
    console.log(`✅ Open issues: ${openIssuesResponse.data.length}\n`);
    
    console.log('✅ All tests passed! GitHub Issues API is working correctly.\n');
    
    // Show CURL commands
    console.log('📋 CURL Commands for Testing:');
    console.log('─────────────────────────────────────────');
    console.log('\n1. List all issues (open + closed):');
    console.log(`curl -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     "https://api.github.com/repos/${OWNER}/${REPO}/issues?state=all"`);
    
    console.log('\n2. List only open issues:');
    console.log(`curl -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     "https://api.github.com/repos/${OWNER}/${REPO}/issues?state=open"`);
    
    console.log('\n3. Get a specific issue (e.g., #1):');
    console.log(`curl -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     "https://api.github.com/repos/${OWNER}/${REPO}/issues/1"`);
    
    console.log('\n4. Create a new issue:');
    console.log(`curl -X POST "https://api.github.com/repos/${OWNER}/${REPO}/issues" \\`);
    console.log(`     -H "Authorization: token YOUR_GITHUB_PAT" \\`);
    console.log(`     -H "Accept: application/vnd.github.v3+json" \\`);
    console.log(`     -d '{"title":"Test Issue from API","body":"This is a test issue created via GitHub API","labels":["bug"]}'`);
    
    console.log('\n\n💡 Note: Replace YOUR_GITHUB_PAT with your actual GitHub Personal Access Token\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      
      if (error.response.status === 404) {
        console.log('\n💡 Repository not found. Please check:');
        console.log(`   - Repository exists: https://github.com/${OWNER}/${REPO}`);
        console.log('   - Your token has access to this repository');
      } else if (error.response.status === 401) {
        console.log('\n💡 Authentication failed. Please check:');
        console.log('   - Your GitHub token is valid');
        console.log('   - Token has "repo" scope for private repos');
      }
    }
  }
}

testSpecificRepo();

// Made with Bob
