# Your First Week Here

An AI-powered onboarding assistant that generates personalized 5-day onboarding plans for new employees based on their role. Uses Claude to analyze company handbook articles and GitHub issues to create actionable, role-specific tasks.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/oscar-ai.git
cd your-first-week-here
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your API keys to `.env`:

```
ANTHROPIC_API_KEY=your_anthropic_key
GITHUB_TOKEN=your_github_token
```

### Getting the API keys

- **ANTHROPIC_API_KEY**: Get it from the [Anthropic Console](https://console.anthropic.com/settings/keys)
- **GITHUB_TOKEN**: Create a Personal Access Token at [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta). The token needs `read` access to the repository's issues and pull requests.

5. Run the development server:

```bash
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000)
