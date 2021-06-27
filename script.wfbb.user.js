// ==UserScript==
// @name        Warezforums IMDB Poster [WF][BB]
// @version     0.1.1
// @description Generates a Template for the Movie&TV section of WarezForums
// @author      JogZ37 [Original by BiliTheBox (Thanks!!!)]
// @icon        https://warezforums.com/images/favicon.ico
// @include     /^https?:\/\/warezforums\.com\/newthread\.php\?fid\=(32|33|76|105|100|101|85|102|79|106|104|103|80)/
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

/* eslint-env jquery */

main();

const htmlTemplate = `
<button id="gmShowTemplate" name="templateButton" style="display:none; margin-top: 14px; margin-left: 5px;" type="button">Show</button>
<dr style="clear: left;" id="OmdbGenerator">
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="imdbsearch" for="SemanticSearch">Imdb Search:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <input type="text" id="hiddenIID" value="" style="display:none">
<div class="ui search" id="searchBox" size="45">
<input type="text" class="prompt inputbox autowidth" id="searchID" size="45" placeholder="IMDB ID, Title, or Link"></input>
<div class="results inputbox" id="search_results" size="45" style="display:none;"></div> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="screenfill" for="Screenlinks">Screenshot Links:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <input type="text" id="screensLinks" value="" class="inputbox autowidth" size="45" placeholder="(Optional...)"></input> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="uToobfill" for="uTooblink">Youtube Link:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <input type="text" id="ytLink" value="" class="inputbox autowidth" size="45" placeholder="(Optional...)"></input> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="dlinkfill" for="dlinkfill">Download Link:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <input type="text" id="dLink" value="" class="inputbox autowidth" size="45" placeholder="Required"</input> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="hidefill" for="hidefill">Hide Amount:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <input type="text" id="hideAmt" value="" class="inputbox autowidth" size="45" placeholder="(Optional...)"></input> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"> <label id="mediaInf" for="fileMediainfo">Mediainfo:</label> </dt>
<dd style="padding-top: 14px;float: left;"> <textarea rows="1" style="width:100%;" class="inputbox autowidth" id="mediaInfo" size="45" placeholder="(Optional...)"></textarea> </dd>
<dt style="padding-top: 14px;float: left;clear: left;width: 20%;padding-left: 14px;"><label> </label></dt>
<dd style="padding-top: 10px;float: left;">
<button class="button--primary button button--icon" id="gmGenerate" name="templateButton" type="button">Generate Template</button>
&nbsp;
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;

const omdbinput = `
<button id="gmShowTemplate" name="templateButton" style="display:none; margin-top: 14px; margin-left: 5px;" type="button">Show</button>
<dr style="clear: left;" id="OmdbGenerator">
<dt style="padding-top: 20px;float: left;clear: left;width: 20%;padding-left: 14px;">
<label id="Keylabel" for="omdbapi">OMDB Key:</label>
</dt>
<dd style="padding-top: 14px;float: left;">
<input type="text" id="omdbKey" value="" class="inputbox autowidth"/>
<button class="button--primary button button--icon" id="gmSaveKey" name="templateButton" type="button" style="margin-left: 20px;">Save Key</button>
&nbsp;
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;

function main() {
	GM.getValue('APIKEY', 'foo').then(value => {
		var tabURL = window.location.href;
		if (tabURL.includes('processed')) {
			return;
		}
		var APIVALUE = value;
		const htmlpush = document.getElementsByClassName('content')[0];
		const titlechange = document.getElementById('title');
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : omdbinput;
		if (titlechange) {
			document.getElementById('title').className += 'input';
		}
		sectionSearch(APIVALUE, tabURL);
		$(document).on('keydown', function(event) {
			if (event.key == 'Escape') {
				$('#OmdbGenerator').hide();
				document.getElementById('gmShowTemplate').style.display = 'block';
			}
		});
		$('#gmHideTemplate').click(() => hideTemplate());
		$('#gmShowTemplate').click(() => showTemplate());
		$('#gmSaveKey').click(() => saveApiKey(APIVALUE, htmlpush));
		$('#gmGenerate').click(() => generateTemplate(APIVALUE));
	});
}

function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#OmdbGenerator').show();
}
function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#OmdbGenerator').hide();
}

function sectionSearch(APIVALUE, tabURL) {
	var sectionCheck = tabURL.match(/\d+/, '');
	var Movies = '32 76 105 100 101 85 102';
	var Series = '33 79 106 104 103 80';
	var query;
	if (Series.includes(sectionCheck)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=series`;
	} else if (Movies.includes(sectionCheck)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=movie`;
	} else {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}`;
	}
	$('#searchBox').search({
		type: 'category',
		apiSettings: {
			url: query,
			onResponse: function(myfunc) {
				var response = {
					results: {}
				};
				$.each(myfunc.Search, function(index, item) {
					var category = item.Type.toUpperCase() || 'Unknown',
						maxResults = 10;
					if (index >= maxResults) {
						return false;
					}
					if (response.results[category] === undefined) {
						response.results[category] = {
							name: '~~~~~~~~~~' + category + '~~~~~~~~~~',
							results: []
						};
					}
					var Name = item.Title + ' (' + item.Year + ')';
					response.results[category].results.push({
						title: Name,
						description: Name,
						imdbID: item.imdbID
					});
				});
				return response;
			}
		},
		fields: {
			results: 'results',
			title: 'name'
		},
		onSelect: function(response) {
			$('#hiddenIID').val(response.imdbID);
			$('#searchID').val(response.title);
		},
		minCharacters: 3
	});
}

function saveApiKey(APIVALUE, htmlpush) {
	if (APIVALUE == 'foo') {
		let omdbKey = $('#omdbKey').val();
		if (omdbKey) {
			GM.setValue('APIKEY', omdbKey);
		} else {
			alert("You Didn't Enter Your Key!!");
		}
		document.getElementById('OmdbGenerator').remove();
		document.getElementById('gmShowTemplate').remove();
		main();
	}
}

function generateTemplate(APIVALUE) {
	var IID = $('#hiddenIID').val();
	var screenshots = $('#screensLinks').val();
	var uToob = $('#ytLink').val();
	var MEDIAINFO = $('#mediaInfo').val();
    var DLINK = $('#dLink').val();
    var HIDE = $('#hideAmt').val();

    var hostPrefix = "0";
	var DL = ``;
    if (DLINK) {
        if (DLINK.includes('drive')) {
            hostPrefix = "6";
            DL = `[url=${DLINK}][color=#00FF00]Gdrive[/color][/url]`;
        } else if (DLINK.includes('mega')) {
            hostPrefix = "7";
            DL = `[url=${DLINK}][color=#FF0000]MEGA[/color][/url]`;
        } else if (DLINK.includes('crypt')) {
            hostPrefix = "6";
            DL = `[url=${DLINK}][color=#00FF00]Gdrive[/color][/url]`;
        }
    }
	if (!IID) {
		IID = $('#searchID').val();
		if (IID.includes('imdb')) {
			IID = IID.match(/tt\d+/)[0];
		}
	}
	if (!IID) {
		alert("You Didn't Select A Title or Enter a IMDB ID!");
	} else {
		if (screenshots) {
			screenshots = screenshots.split(' ');
			var screen = `\n[hr][size=150][color=#fac51c][b]Screenshots[/b][/color][/size]\n[spoiler][align=center]\n`;
			for (let ss of screenshots) {
				screen += `[img]${ss}[/img]\n\n`;
			}
			screen += `[/align][/spoiler]\n\n`;
		} else {
			screen = '';
        }
		GM_xmlhttpRequest({
			method: 'GET',
			url: `http://www.omdbapi.com/?apikey=${APIVALUE}&i=${IID}&plot=full&y&r=json`,
			onload: function(response) {
				let json = JSON.parse(response.responseText);
				let poster =
					json.Poster && json.Poster !== 'N/A'
						? '[center][img]' + json.Poster + '[/img]\n'
						: '';
				if (json.Title && json.Title !== 'N/A') {
					var title = '[color=#fac51c][b][size=150]' + json.Title;
				} else {
					alert(
						"You Messed Up! Check That You've Entered Something Into The IMDB Field!"
					);
				}
				let year =
					json.Year && json.Year !== 'N/A'
						? json.Year + ')[/size][/b][/color]\n'
						: '';
				let imdbId =
					json.imdbID && json.imdbID !== 'N/A'
						? '[url=https://www.imdb.com/title/' +
						  json.imdbID +
						  '][img]https://i.imgur.com/rcSipDw.png[/img][/url]'
						: '';
				let rating =
					json.imdbRating && json.imdbRating !== 'N/A'
						? '[size=150][b]' + json.imdbRating + '[/b]/10[/size]\n'
						: '';
				let imdbvotes =
					json.imdbVotes && json.imdbVotes !== 'N/A'
						? '[size=150][img]https://i.imgur.com/sEpKj3O.png[/img]' +
						  json.imdbVotes +
						  '[/size][/center]\n'
						: '';
				let plot =
					json.Plot && json.Plot !== 'N/A'
						? '[hr][size=150][color=#fac51c][b]Plot[/b][/color][/size]\n\n ' +
						  json.Plot +
						  '\n'
						: '';
				let rated =
					json.Rated && json.Rated !== 'N/A'
						? '[B]Rating: [/B]' + json.Rated + '\n'
						: '';
				let genre =
					json.Genre && json.Genre !== 'N/A'
						? '[*][B]Genre: [/B] ' + json.Genre + '\n'
						: '';
				let director =
					json.Director && json.Director !== 'N/A'
						? '[*][B]Directed By: [/B] ' + json.Director + '\n'
						: '';
				let writer =
					json.Writer && json.Writer !== 'N/A'
						? '[*][B]Written By: [/B] ' + json.Writer + '\n'
						: '';
				let actors =
					json.Actors && json.Actors !== 'N/A'
						? '[*][B]Starring: [/B] ' + json.Actors + '\n'
						: '';
				let released =
					json.Released && json.Released !== 'N/A'
						? '[*][B]Release Date: [/B] ' + json.Released + '\n'
						: '';
				let runtime =
					json.Runtime && json.Runtime !== 'N/A'
						? '[*][B]Runtime: [/B] ' + json.Runtime + '\n'
						: '';
				let production =
					json.Production && json.Production !== 'N/A'
						? '[*][B]Production: [/B] ' + json.Production + '\n'
						: '';
				let yt = uToob
					? '[hr][size=150][color=#fac51c][b]Trailer[/b][/color][/size]\n\n [align=center][video=youtube]' +
					  uToob +
					  '[/video][/align]\n'
					: '';
				let mediainf = MEDIAINFO
					? '[hr][size=150][color=#fac51c][b]Media Info[/b][/color][/size]\n\n [mediainfo]' +
					  MEDIAINFO +
					  '\n[/mediainfo]\n'
					: '';
				let ddl = `[hr][center][size=150][color=#fac51c][b]Download Link[/b][/color][/size]\n
[hide=${HIDE}][b]${DL}[/b][/hide]
[/center]`;
				let dump = `${poster}${title} (${year}${imdbId} ${rating}${imdbvotes}${plot}
[hr][size=150][color=#fac51c][b]Movie Info[/b][/color][/size]\n
[LIST][*]${rated}${genre}${director}${writer}${actors}${released}${runtime}${production}[/LIST]\n${yt}${mediainf}${screen}${ddl}`;
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					alert(
						'Something went wrong! Please report to my Developer.... I get scared when I crash ☹️' +
							err
					);
				} finally {
					let xf_title_value = document.getElementsByName('subject')[0].value;
					if (!xf_title_value) {
						document.getElementsByName('subject')[0].value =
							json.Title + ' (' + json.Year + ')';
					}
                    document.getElementsByName('threadprefix')[0].value = hostPrefix;
				}
			}
		});
	}
}

//--- CSS styles make it work...
GM_addStyle(
	'                                         \
    @media screen and (min-width: 300px) {    \
      .inputbox{                              \
            max-width:330px;                  \
            }                                 \
      .result{                                \
            max-height:10px;                  \
            display:unset;                    \
      }                                       \
      .content{                               \
            overflow:unset;                   \
            min-height:unset;                 \
            cursor:pointer;                   \
            padding-bottom:unset;             \
            line-height:unset;                \
}                                             \
'
);