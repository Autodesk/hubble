import datetime
import os
import subprocess
import sys

# Simple class to get floating-point values printed prettily
class PrettyFloat(float):
	def __str__(self):
		return "%0.3f" % self

# Executes a single command and returns stdout and stderr
def executeCommand(command, stdin = None, cwd = None):
	with subprocess.Popen(command, stdout = subprocess.PIPE, stderr = subprocess.PIPE, stdin = (subprocess.PIPE if stdin != None else None), cwd = cwd) as process:
		stdout, stderr = process.communicate(input = (stdin.encode("utf-8") if stdin != None else None))

		print(stderr.decode("utf-8"), file = sys.stderr)
		sys.stderr.flush()

		if process.returncode != 0:
			raise RuntimeError(command[0] + " failed with exit code " + str(process.returncode))

		return stdout, stderr

# Convenience function to parse a date from a string
def parseDate(string):
	return datetime.datetime.strptime(string, "%Y-%m-%d").date()
