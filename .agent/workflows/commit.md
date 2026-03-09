---
description: Stage, commit, and push changes with a descriptive message
---

Follow these steps to stage, commit, and push your changes.

1. **Stage Changes**: Stage all changes in the repository.
   // turbo

   ```bash
   git add .
   ```

2. **Review Staged Changes**: Check what is being committed to generate an accurate message.
   // turbo

   ```bash
   git diff --cached
   ```

3. **Generate Commit Message**: Based on the diff, write a clear, concise commit message. Use the Conventional Commits format (e.g., `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).

4. **Commit Changes**: Use the message generated in the previous step.
   // turbo

   ```bash
   git commit -m "<commit_message>"
   ```

5. **Push to Origin**: Push the local commits to the remote repository.
   // turbo
   ```bash
   git push origin $(git branch --show-current)
   ```
