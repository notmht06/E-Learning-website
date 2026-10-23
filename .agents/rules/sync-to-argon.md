# Continuous Synchronization to Gemini Argon Directory

Whenever any modifications, refactoring, or new features are created in this project:
1. Immediately synchronize the updated code to `E:\personal\zanjirzan_full_project_v2`.
2. Exclude `node_modules`, `.next`, `.venv`, `.git`, `__pycache__`, `.pytest_cache`, and temporary files.
3. Use the automated script:
   `powershell -ExecutionPolicy Bypass -File "e:\personal\philosophy_zanjirzan_app\scripts\sync_to_argon.ps1"`
   or `robocopy "e:\personal\philosophy_zanjirzan_app" "E:\personal\zanjirzan_full_project_v2" /MIR /XD node_modules .next .venv .git __pycache__ .pytest_cache /XF *.pyc *.log /NP`
