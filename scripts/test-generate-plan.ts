/**
 * Test script for the /api/generate-plan endpoint
 * 
 * Usage:
 *   bun run scripts/test-generate-plan.ts
 *   bun run scripts/test-generate-plan.ts --role "Designer"
 *   bun run scripts/test-generate-plan.ts --name "John" --role "Sales" --goals "Close my first deal"
 * 
 * Make sure your Next.js dev server is running on port 3000
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";

interface GeneratePlanArgs {
  name: string;
  role: string;
  goals?: string;
}

async function testGeneratePlan(args: GeneratePlanArgs) {
  console.log("\n🚀 Testing /api/generate-plan endpoint\n");
  console.log("Request payload:");
  console.log(JSON.stringify(args, null, 2));
  console.log("\n⏳ Generating onboarding plan (this may take a moment)...\n");

  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Request failed (${response.status}): ${error}`);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`❌ API returned error: ${data.error}`);
      process.exit(1);
    }

    console.log(`✅ Plan generated successfully in ${elapsed}s\n`);
    console.log("=".repeat(60));
    
    const plan = data.plan;
    
    // Print welcome message
    console.log(`\n👋 ${plan.welcomeMessage}\n`);
    
    // Print each day
    for (const day of plan.days) {
      console.log(`\n📅 Day ${day.day}: ${day.title}`);
      console.log(`   ${day.summary}`);
      console.log("");
      
      for (const task of day.tasks) {
        const typeEmoji = {
          reading: "📚",
          meeting: "👥",
          task: "✅",
          exploration: "🔍",
          contribution: "🚀",
        }[task.type] || "•";
        
        console.log(`   ${typeEmoji} [${task.priority}] ${task.title}`);
        if (task.handbookArticle) {
          console.log(`      📖 Handbook: ${task.handbookArticle.title} (${task.handbookArticle.slug})`);
        }
        if (task.githubIssue) {
          console.log(`      🐛 Issue #${task.githubIssue.number}: ${task.githubIssue.title}`);
        }
        if (task.githubPR) {
          console.log(`      🔀 PR #${task.githubPR.number}: ${task.githubPR.title}`);
        }
      }
    }
    
    // Print suggested first issue if present
    if (plan.suggestedFirstIssue) {
      console.log("\n" + "=".repeat(60));
      console.log("\n🎯 Suggested First Issue:");
      console.log(`   #${plan.suggestedFirstIssue.number}: ${plan.suggestedFirstIssue.title}`);
      console.log(`   URL: ${plan.suggestedFirstIssue.url}`);
      console.log(`   Why: ${plan.suggestedFirstIssue.reason}`);
    }
    
    // Print key contacts if present
    if (plan.keyContacts && plan.keyContacts.length > 0) {
      console.log("\n" + "=".repeat(60));
      console.log("\n👥 Key Contacts:");
      for (const contact of plan.keyContacts) {
        console.log(`   • ${contact.role}: ${contact.purpose}`);
      }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("\n📦 Full JSON response saved to: scripts/last-plan.json\n");
    
    // Save full response to file
    await Bun.write(
      "scripts/last-plan.json",
      JSON.stringify(data.plan, null, 2)
    );

  } catch (error) {
    console.error(`❌ Request failed: ${error}`);
    console.error("\n💡 Make sure your Next.js dev server is running: bun run dev");
    process.exit(1);
  }
}

// Parse CLI arguments
function parseArgs(): GeneratePlanArgs {
  const args = process.argv.slice(2);
  
  let name = "Pedro";
  let role = "Software Engineer";
  let goals: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (args[i] === "--role" && args[i + 1]) {
      role = args[i + 1];
      i++;
    } else if (args[i] === "--goals" && args[i + 1]) {
      goals = args[i + 1];
      i++;
    }
  }

  return { name, role, goals };
}

// Run the test
const args = parseArgs();
testGeneratePlan(args);
