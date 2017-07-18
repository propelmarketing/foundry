
import argparse
import start
import init

from subprocess import check_output


###############################################################################
# Configure Arguments
###############################################################################


parser = argparse.ArgumentParser()

parser.add_argument(
    "action",
    choices=[ "start", "init" ]
)

parser.add_argument(
    "application",
    choices=[ "<server>", "ubuntu" ]
)

parser.add_argument(
    "env",
    nargs='?',
    choices=[ "development", "test", "staging", "qa", "production" ],
    default="development",
    help="The Docker environment to build"
)

parser.add_argument(
    "-n",
    "--hostname",
    help="Developer username"
)

parser.add_argument(
    "-u",
    "--username",
    default="",
    help="Developer username"
)

parser.add_argument(
    "-c",
    "--container-name",
    help="Container Image name"
)

parser.add_argument(
    "-d",
    "--db-container-name",
    default="local.<server>.db",
    help="Database Container Image name"
)

parser.add_argument(
    "-v",
    "--verbose",
    action="store_true",
    help="Toggle the Docker Compose output verbosity"
)

###############################################################################
# Program
###############################################################################

def isAuthenticated():
    """
    """

    token = check_output([ "aws", "ecr", "get-authorization-token" ])
    return True if token else False

def login():
    """
    """

    login_cmd = check_output([
        "aws",
        "ecr",
        "get-login",
        "--no-include-email",
        "--region",
        "us-east-1"
    ])

    if not login_cmd:
        raise Exception("No result was returned by get-login. Login failed.")

    result = check_output(login_cmd.split(" "))
    print result

def main():
    """
    """

    if not isAuthenticated():
        login()

    args = parser.parse_args()
    if args.action == "init":
        init.run(args)
    if args.action == "start":
        start.start_docker_container(args)

main()
