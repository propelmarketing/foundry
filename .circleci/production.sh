#!/bin/bash

# When the Acceptance tests pass and Toadsworth is notified it sends an API request back to this job to kick off a Production deploy

if [ "$acceptance_passed" == "yep" ]; then
  echo "Deploying to production...beep boop beep"
  echo "When the production deploy completes a slack message is sent to a channel to notify folks that it's live"
else
  echo "Waiting for Acceptance tests to pass"
fi
