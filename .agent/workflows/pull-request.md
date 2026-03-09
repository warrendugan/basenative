---
description: Create a pull request from the current branch to main (or a specified target branch)
---

Follow these steps to create a pull request using the GitHub CLI.

1. **Check Current Branch**: Verify you are on the correct source branch.
   // turbo

   ```bash
   git branch --show-current
   ```

2. **Push Current Branch**: Ensure the latest changes are pushed to origin.
   // turbo

   ```bash
   git push origin $(git branch --show-current)
   ```

3. **Analyze All Commits**: Review all commits between the target branch and current branch to understand the full scope of changes.
   // turbo

   ```bash
   git log <target_branch>..HEAD --oneline
   ```

4. **Analyze Full Diff**: Review the complete diff between branches to capture all file changes, including dependency updates, configuration changes, and code modifications.
   // turbo

   ```bash
   git diff <target_branch>..HEAD --stat
   ```

   Additionally, if needed, inspect specific files or the full diff for deeper context:
   // turbo

   ```bash
   git diff <target_branch>..HEAD
   ```

5. **Create Pull Request**: Create a PR targeting `main` by default.
   - If the user specifies a different target branch, replace `main` with the desired branch name.
   - Generate a clear, descriptive title based on the primary purpose of the changes.
   - Generate a comprehensive PR body that includes:
     - **Summary**: High-level description of what this PR accomplishes
     - **Changes**: Detailed breakdown of all changes grouped by category (e.g., dependencies, configuration, features, fixes, docs)
     - **Motivation**: Why these changes were made
     - Reference specific commits, files changed, and version updates where applicable
       // turbo

   ```bash
   gh pr create --base <target_branch> --title "<pr_title>" --body "<pr_body>"
   ```

   **Parameters**:
   - `--base`: Target branch (default: `main`, override if user specifies)
   - `--title`: Short, descriptive PR title reflecting the main purpose
   - `--body`: Comprehensive summary derived from commit history and diff analysis

6. **Confirm PR Created**: Display the PR URL for the user.
   // turbo

   ```bash
   gh pr view --web
   ```
