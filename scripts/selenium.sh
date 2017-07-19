if [ ! -z $CI_PULL_REQUEST ] || [ "$CIRCLE_BRANCH" = "master" ]; then
  yarn selenium;
fi
