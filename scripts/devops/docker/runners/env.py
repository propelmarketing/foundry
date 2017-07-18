
import os
from subprocess import call, check_output


class EnvRunner:
    """
    """

    def __init__(self, application, env, container_name=None, db_container_name=None, username=None, hostname=None):
        """
        """

        if not application:
            raise Exception("The name of the application is required")

        if not env:
            raise Exception("The targeted environment is required")

        self.env = env
        self.application = application

        self.container_name = container_name
        if not self.container_name:
            self.container_name = self.env + ".thrivehive.com"

        self.db_container_name = db_container_name
        self.username = username
        self.hostname = hostname

        self.aws_access_key_id, self.aws_secret_access_key = self.get_aws_creds()

        self.set_cwd()

        self.compose = self.get_compose_file()

        self.build_environment()


    def build_environment(self):
        """
        """

        os.environ["APPLICATION"] = self.application
        os.environ["AWS_ACCESS_KEY_ID"] = self.aws_access_key_id
        os.environ["AWS_SECRET_ACCESS_KEY"] = self.aws_secret_access_key
        os.environ["CONTAINER_NAME"] = self.container_name
        os.environ["NODE_ENV"] = self.env


    def get_aws_creds(self):
        """
        """

        aws_access_key_id = check_output([ "aws", "configure", "get", "aws_access_key_id" ])
        if not aws_access_key_id:
            raise Exception('aws_access_key_id was not found. Do you have AWS Credentials installed on your computer?')
        aws_secret_access_key = check_output([ "aws", "configure", "get", "aws_secret_access_key" ])
        if not aws_secret_access_key:
            raise Exception('aws_secret_access_key was not found. Do you have AWS Credentials installed on your computer?')
        return (aws_access_key_id.strip(), aws_secret_access_key.strip())

    def get_compose_file(self):
        """
        """

        return "./config/docker/docker-compose.yml"


    def set_cwd(self):
        """
        """

        # TODO when this operates as the devops for all services, this should be it's own repo. Once that happens,
        # we'll want to have the script change directory to operate in the root of the provided application
        #
        # if not self.path:
        #   self.path = os.path.join(os.getcwd(), self.application)
        # os.chdir(self.path)

        pass


class EnvStartRunner(EnvRunner):
    """
    """


    def after_start(self, result):
        """
        """

        pass

    def before_start(self, cmd):
        """
        """

        return cmd

    def start(self, verbose=False):
        """
        """

        print "*** Running Docker Compose up ***"

        cmd = [
            "docker-compose",
        ]

        if verbose:
            cmd.append("--verbose")

        cmd.append("-f")
        cmd.append(self.compose)

        cmd = self.before_start(cmd)

        cmd.append("up")
        cmd.append("-d")

        result = call(cmd)

        self.after_start(result)
