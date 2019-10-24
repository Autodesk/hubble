from .ReportDaily import *

# Query the number of repositories larger than 1GB
class ReportRepoSize(ReportDaily):
	def name(self):
		return "repository-size"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(
			self.executeGHEConsole('''
				puts "repository\tarchived?\trepository size [MB]\n"
				Repository
					.select{ |repo|
						repo.disk_usage > 1024*1024 &&
						(repo.network_root? || repo.disk_usage > repo.root.disk_usage)
					}
					.sort_by{ |repo| -repo.disk_usage }
					.map{ |repo| puts "#{repo.nwo}\t#{repo.archived?}\t#{repo.disk_usage/1024}" }
				'''))
		self.header = ["date", "repositories >1GB"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
