from .ReportDaily import *

# Organizations created before September 2015 might have legacy admin
# teams. In order to get the best performance out of GHE, these teams
# should be migrated to the improved permissions model.
# c.f. https://help.github.com/enterprise/2.11/user/articles/migrating-your-previous-admin-teams-to-the-improved-organization-permissions/
class ReportTeamsLegacy(ReportDaily):
	def name(self):
		return "teams-legacy"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(
			self.executeRubyScriptOnServer('''
				puts "organization\tteam\tmembers\n"
				User.where(:type => "Organization")
				    .order("login")
				    .each do |o|
					if o.teams && o.teams.legacy_admin.size > 0
						o.teams.legacy_admin.order("name").each { |t|
							puts "#{o.login}\t#{t.name}\t#{t.members.size}"
						}
					end
				end'''))
		self.header = ["date", "legacy admin teams"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
