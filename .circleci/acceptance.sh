#!/bin/bash

# When the System tests pass and Toadsworth is notified it sends an API request back to this job to kick off Acceptance Tests

if [ "$system_passed" == "yep" ]; then
  echo "Sending out for acceptance tests...beep boop beep"
  echo "When the acceptance tests are done somebody sends a slack message to Toadsworth who is turn calls the CircleCI API with $acceptance_passed"
else
  echo "Waiting for System tests to pass"
fi
