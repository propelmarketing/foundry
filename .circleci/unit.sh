#!/bin/bash

# Let's assume we're kicking off the unit tests somewhere else here:

echo "Sending out for unit tests...beep boop beep"
echo "When the unit tests are done somebody sends a slack message to Toadsworth who is turn calls the CircleCI API with $unit_passed"
