
import time
from subprocess import call
from development import DevelopmentStartRunner


class TestStartRunner(DevelopmentStartRunner):
    """
    """

    def after_start(self, result):
        """
        """

        if result == 0:
            print "*** Migrating Database ***"
            time.sleep(2)
            ret = call([
                "docker",
                "exec",
                self.container_name,
                "/bin/bash",
                "/usr/local/src/<server>/scripts/docker/init_db.sh"
            ])
