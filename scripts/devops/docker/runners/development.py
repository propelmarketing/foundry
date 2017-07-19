
import os
from env import EnvStartRunner


class DevelopmentStartRunner(EnvStartRunner):
    """
    """

    def before_start(self, cmd):
        """
        """

        os.environ["DEVELOPER"] = self.username
        os.environ["DB_CONTAINER_NAME"] = self.db_container_name

        cmd.append("-f")
        cmd.append("./config/docker/docker-compose.dev.yml")

        return cmd
