#!/bin/bash

# When the Unit tests pass and Toadsworth is notified it sends an API request back to this job to kick off Integration Tests

if [ "$unit_passed" == "yep" ]; then
  echo "Sending out for integration tests...beep boop beep"
  echo "When the integration tests are done somebody sends a slack message to Toadsworth who is turn calls the CircleCI API with $integration_passed"
else
  echo "Waiting for Unit tests to pass"
fi
