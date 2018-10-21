#!/bin/bash

# When the Integration tests pass and Toadsworth is notified it sends an API request back to this job to kick off System Tests

if [ "$integration_passed" == "yep" ]; then
  echo "Sending out for system tests...beep boop beep"
  echo "When the system tests are done somebody sends a slack message to Toadsworth who is turn calls the CircleCI API with $system_passed"
else
  echo "Waiting for Integration tests to pass"
fi
