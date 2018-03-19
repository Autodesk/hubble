from .Report import *

# Lists all orgs and their owners without site admins or suspended users
class ReportOrgOwners(Report):
	def name(self):
		return "org-owners"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeGHEConsole('''
				puts "organization\towner(s)\n"
				User.where(:type => "Organization")
				    .where("''' + self.andExcludedEntities("login", "").replace('"', '\\"') + '''")
				    .order("login")
				    .each do |org|
					owners = org.admins.where(:disabled => false, :suspended_at => nil, :gh_role => nil)
					                   .where("''' +  self.andExcludedUsers("login", "").replace('"', '\\"') + '''")
					                   .order("login")
					                   .join(",")
					puts "#{org.login}\t#{owners}\n"
				end'''))
