# Auto-Deployment Rule
Whenever you finish modifying code or implementing a feature, you MUST automatically commit and push the changes to Git using the `run_command` tool.
This is required because the user tests changes on the live Vercel environment.
Use the following command sequence:
`git add .; git commit -m "Update from Antigravity"; git push`
