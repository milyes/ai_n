{
  "workflows": {
    "Start Flask API": {
      "name": "Start Flask API",
      "author": "agent",
      "metadata": {
        "agentRequireRestartOnSave": false
      },
      "tasks": [
        {
          "task": "shell.exec",
          "args": "cd FlaskServer && python main.py",
          "waitForPort": 5001
        }
      ]
    }
  }
}