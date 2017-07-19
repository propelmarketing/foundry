
from env import EnvStartRunner


class ProductionStartRunner(EnvStartRunner):
    """
    """

    def before_start(self, cmd):
        """
        """

        print "*** Compiling Application ***"

        result = check_output([ "yarn", "build" ])
        print result

        return cmd
