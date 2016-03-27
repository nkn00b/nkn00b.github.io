
function ScoreViewerViewModel()
{
	var self = this;

	self.tracks = ko.observableArray();
	self.model = new ScoreViewerModel(self.tracks);
	self.username = ko.observable();

	self.model.loadSettings();

	self.showGrade = ko.observable(self.model.settings["showGrade"]);
	self.showScore = ko.observable(self.model.settings["showScore"]);
	self.showMark = ko.observable(self.model.settings["showMark"]);

	self.showGrade.subscribe(function(newValue)
	{
		self.model.settings["showGrade"] = self.showGrade();
		self.model.saveSettings();
	});
	self.showScore.subscribe(function(newValue)
	{
		self.model.settings["showScore"] = self.showScore();
		self.model.saveSettings();
	});
	self.showMark.subscribe(function(newValue)
	{
		self.model.settings["showMark"] = self.showMark();
		self.model.saveSettings();
	});

	self.loadTracks = function()
	{
		self.model.loadTracks();
	};
	self.loadTracks();

	self.filter15_Clear = new FilterModel(self.tracks, './data/15_cl.json', [15,16]);
	self.filter15_AAA = new FilterModel(self.tracks, './data/15_aaa.json', [15,16]);
	self.filter15_99 = new FilterModel(self.tracks, './data/15_99.json', [15,16]);
	self.filter14_Clear = new FilterModel(self.tracks, './data/14_cl.json', [14]);
	self.filter14_AAA = new FilterModel(self.tracks, './data/14_aaa.json', [14]);
	self.filter14_99 = new FilterModel(self.tracks, './data/14_99.json', [14]);

	self.loadUserdata = function()
	{
		self.model.loadUserdata(self.username());
	};
}

$(document).ready(function()
{
	ko.applyBindings(new ScoreViewerViewModel());
});
