
function Track(json, difficulty)
{
	var self = this;
	self.id = json['id'];
	self.title = json['title'];
	self.difficulty = difficulty;
	self.level = json[difficulty]['level'];

	self.grade = ko.observable("　");
	self.setGrade = function(grade)
	{
		if (grade == "" || grade == null)
		{
			self.grade("　");
		}
		else
		{
			self.grade(grade.toUpperCase());
		}
	};

	self.score = ko.observable("　");
	self.setScore = function(score)
	{
		if (parseInt(score) >= 0)
		{
			self.score(Math.floor(parseInt(score, 10) / 1000));
		}
		else
		{
			self.score("　");
		}
	};

	self.is_clear = ko.observable(false);
	self.is_aaa = ko.observable(false);
	self.is_99 = ko.observable(false);

	self.clearmark_id = ko.observable(0);
	self.clearmark = ko.computed(function()
	{
		var mark = self.clearmark_id();
		if (mark == 1)
		{
			return "GreenYellow"; // Complete
		}
		else if (mark == 2) {
			return "DarkViolet"; // Hard Clear
		}
		else if (mark == 3)
		{
			return "Red"; // Ultimate Chain
		}
		else if (mark == 4)
		{
			return "Gold"; // Perfect
		}
		return "rgba(0,0,0,0)";
	});
	self.setClearmark = function(medal)
	{
		if (medal == "comp")
		{
			self.clearmark_id(1);
		}
		else if (medal == "excessive")
		{
			self.clearmark_id(2);
		}
		else if (medal == "uc")
		{
			self.clearmark_id(3);
		}
		else if (medal == "per")
		{
			self.clearmark_id(4);
		}
		else
		{
			self.clearmark_id(0);
		}
	};

	self.sprite_position = ko.computed(function()
	{
		var index = parseInt(self.id);
		var left = index % 16
		var top = Math.floor(index / 16)
		return "-" + (left * 56) + "px -" + (top * 56) + "px";
	});

	self.jacket = ko.computed(function()
	{
		url = "../jackets/webp/";
		if (self.difficulty == 'exhaust')
		{
			url += "2_";
		}
		else if (self.difficulty == 'infinite')
		{
			url += "3_";
		}else if (self.difficulty == 'gravity')
		{
			url += "4_";
		}
		url += Math.floor(parseInt(self.id) / (16*16)) + ".webp";
		return "url('" +  url + "')";
	});

	self.getTrackId = function()
	{
		if (self.difficulty == 'exhaust')
		{
			return self.id + "_2";
		}
		else if (self.difficulty == 'infinite')
		{
			return self.id + "_3";
		}
		else if (self.difficulty == 'gravity')
		{
			return self.id + "_4";
		}
	}
	
	self.tips = ko.computed(function()
	{
		tips = self.title;
		if (self.difficulty == 'exhaust')
		{
			tips += " [EXH]";
		}
		else if (self.difficulty == 'infinite')
		{
			tips += " [INF]";
		}else if (self.difficulty == 'gravity')
		{
			tips += " [GRV]";
		}
		return self.getTrackId() + " " + tips;
	});

}

function FilterModel(tracks, ranks, levels)
{
	var self = this;
	self.tracks = tracks;
	self.ranks = ko.observableArray();
	self.assigned = [];

	$.getJSON(ranks, function(jsondata)
	{
		self.jsondata = jsondata;
		var tmp = [];
		for (var i = 0; i < jsondata.length; i++)
		{
			rank = { "title": jsondata[i]["title"], "tracks": jsondata[i]["tracks"] };
			Array.prototype.push.apply(self.assigned, jsondata[i]["tracks"]);
			rank.filter = function(tracks)
			{
				return ko.utils.arrayFilter(self.tracks(), function(track)
					{
						return ($.inArray(track.getTrackId(), tracks) >= 0);
					});
			};
			tmp.push(rank);
		};
		uncategorized = { "title": "未分類", "tracks": self.assigned };
		uncategorized.filter = function(tracks)
		{
			return ko.utils.arrayFilter(self.tracks(), function(track)
				{
					return ($.inArray(track.getTrackId(), tracks) < 0) && (levels.indexOf(track.level) >= 0);
				});
		};
		tmp.push(uncategorized);

		ko.utils.arrayPushAll(self.ranks, tmp);
	});
}

function ScoreViewerModel(tracks)
{
	var self = this;
	self.tracks = tracks;
	self.tracksDict = {};

	self.loadTracks = function()
	{
		var tmp = [];
		$.getJSON("./data/tracks.json", function(json)
		{
			for (var i = 0; i < json['tracks'].length; i++)
			{
				if ('exhaust' in json['tracks'][i])
				{
					var t = new Track(json['tracks'][i], 'exhaust');
					self.tracksDict[t.getTrackId()] = t;
					tmp.push(t);
				}
				if ('infinite' in json['tracks'][i])
				{
					var t = new Track(json['tracks'][i], 'infinite');
					self.tracksDict[t.getTrackId()] = t;
					tmp.push(t);
				}
				if ('gravity' in json['tracks'][i])
				{
					var t = new Track(json['tracks'][i], 'gravity');
					self.tracksDict[t.getTrackId()] = t;
					tmp.push(t);
				}
			};
			ko.utils.arrayPushAll(self.tracks, tmp);
		});
	}

	self.loadUserdata = function(username)
	{
		jsonUrl = "";
		if (username == "" || username == null)
		{
			return;
		}
		else
		{
			jsonUrl = "http://bluekingdragon.dip.jp/sdvx/showUserData.php?id=" + username +"&output=json&callback=?";
		}
		$.getJSON(jsonUrl, function(json)
		{
			tracks = json["profile"]["tracks"];
			for (var i = 0; i < tracks.length; i++)
			{
				var ds = [["exhaust", "_2"], ["infinite", "_3"], ["gravity", "_4"]];
				for (var j=0; j<ds.length; j++)
				{
					if (ds[j][0] in tracks[i])
					{
						var id = tracks[i].id + ds[j][1];
						var medal = tracks[i][ds[j][0]].medal;
						var grade = tracks[i][ds[j][0]].grade;
						var score = tracks[i][ds[j][0]].highscore;
						if (id in self.tracksDict)
						{
							self.tracksDict[id].setClearmark(medal);
							self.tracksDict[id].setGrade(grade);
							self.tracksDict[id].setScore(score);

							if (self.tracksDict[id].clearmark_id() >= 1)
							{
								self.tracksDict[id].is_clear(true);
							}
							else
							{
								self.tracksDict[id].is_clear(false);
							}
							if (grade == "aaa")
							{
								self.tracksDict[id].is_aaa(true);
							}
							else
							{
								self.tracksDict[id].is_aaa(false);
							}
							if (99 <= Math.floor(parseInt(score)/100000))
							{
								self.tracksDict[id].is_99(true);
							}
							else
							{
								self.tracksDict[id].is_99(false);
							}
						}
					}
				}
			};
		});
	}
}
