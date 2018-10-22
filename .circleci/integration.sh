#!/bin/bash

# When the Unit tests pass this job is called by CircleCI in the workflow

echo "Sending out for integration tests...beep boop beep"
echo "When the integration tests are done somebody sends a slack message to Toadsworth who is turn calls the CircleCI API with parameter integration_passed"
