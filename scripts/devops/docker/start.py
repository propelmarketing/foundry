import os
import time

from subprocess import call, check_output

###############################################################################
# Program
###############################################################################


def start_docker_container(args):
    """
    """

    if args.application == "ubuntu":
        start_ubuntu(args)
    else:
        start_service(args)


def start_service(args):
    """
    """

    env = args.env
    if not env:
        raise Exception("Build environment is required")

    if env == "development":
        from runners.development import DevelopmentStartRunner
        Cls = DevelopmentStartRunner
    elif env == "test":
        from runners.test import TestStartRunner
        Cls = TestStartRunner
    elif env == "qa":
        from runners.qa import QaStartRunner
        Cls = QaStartRunner
    elif env == "staging":
        from runners.staging import StagingStartRunner
        Cls =  StagingStartRunner
    elif env == "production":
        from runners.production import ProductionStartRunner
        Cls = ProductionStartRunner
    else:
        raise Exception("Unknown build environment '" + env + "' provided")

    runner = Cls(
        args.application,
        env,
        args.container_name,
        args.db_container_name,
        args.username,
        args.hostname
    )
    runner.start()


def start_ubuntu(args):
    """
    """

    output = check_output([
        "docker",
        "run",
        "-itd",
        "-p",
        "5800:5800",
        "-p",
        "5900:5900",
        "-p",
        "5901:5901",
        "--privileged",
        "--network",
        "bridge",
        "thrivehive/ubuntu",
        "/bin/bash"
    ])
    print output
