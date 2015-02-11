// Generated by CoffeeScript 1.9.0

/*
https://spreadsheets.google.com/feeds/worksheets/{SHEET-ID}/public/basic?alt=json       get grid ids
https://spreadsheets.google.com/feeds/list/{SHEET-ID}/{GRID-ID}/public/values?alt=json  get whole sheet data
https://spreadsheets.google.com/feeds/cells/{SHEET-ID}/{GRID-ID}/public/values          get all cell data
alt=json                                                                                return json
alt=json-in-script&callback={CALLBACK}                                                  return data to callback function

https://spreadsheets.google.com/feeds/worksheets/1wzAwAH4rJ72Zw6r-bjoUujfS5SMOEr38s99NxKmNk4g/public/basic?alt=json
 */
var wizLoader;

wizLoader = (function() {
  function wizLoader() {}

  wizLoader.data = {
    normal: [],
    sort: [],
    daily: [],
    count: 0
  };

  wizLoader.option = {
    sheedId: "1wzAwAH4rJ72Zw6r-bjoUujfS5SMOEr38s99NxKmNk4g",
    gridIds: {
      '四排序題': 'otblre7',
      '每日問答': 'oy2mxv6',
      '黑貓題庫(表單填寫)': 'oj7l0gb'
    },
    loadCount: 0
  };

  wizLoader.addScript = function(gridEntry) {
    var s, src;
    src = "https://spreadsheets.google.com/feeds/cells/" + this.option.sheedId + "/" + gridEntry + "/public/values?alt=json-in-script&callback=wizLoader.load";
    s = document.createElement('script');
    s.setAttribute('src', src);
    return document.body.appendChild(s);
  };

  wizLoader.load = function(data) {
    var tmp;
    tmp = data.feed.id.$t.split('/');
    if (tmp.length === 9) {
      if (tmp[6] === 'otblre7') {
        return this._loadSort(data.feed.entry);
      }
      if (tmp[6] === 'oy2mxv6') {
        return this._loadDaily(data.feed.entry);
      }
      return this._loadNormal(data.feed.entry);
    }
  };

  wizLoader._loadNormal = function(data) {
    var col, entry, index, keys, tmp;
    tmp = {};
    col = 0;
    keys = ['', '', 'color', 'type', 'question', 'answer'];
    for (index in data) {
      entry = data[index];
      if (parseInt(entry.gs$cell.row) <= 1) {
        continue;
      }
      col = parseInt(entry.gs$cell.col);
      if (col >= 2 && col <= 5) {
        if (col === 2) {
          tmp = {};
        }
        tmp[keys[col]] = entry.content.$t;
        if (col === 5) {
          this.data.normal.push(tmp);
        }
      }
    }
    return this._loadComplete();
  };

  wizLoader._loadSort = function(data) {
    var col, entry, index, tmp;
    tmp = [];
    col = 0;
    for (index in data) {
      entry = data[index];
      if (parseInt(entry.gs$cell.row) <= 2) {
        continue;
      }
      col = parseInt(entry.gs$cell.col);
      if (col >= 2 && col <= 6) {
        if (col === 2) {
          tmp = [];
        }
        tmp.push(entry.content.$t);
        if (col === 6) {
          this.data.sort.push(tmp);
        }
      }
    }
    return this._loadComplete();
  };

  wizLoader._loadDaily = function(data) {
    var col, entry, index, tmp;
    tmp = [];
    col = 0;
    for (index in data) {
      entry = data[index];
      if (parseInt(entry.gs$cell.row) <= 2) {
        continue;
      }
      col = parseInt(entry.gs$cell.col);
      if (col === 3) {
        continue;
      }
      if (col >= 2 && col <= 5) {
        if (col === 2) {
          tmp = [];
        }
        tmp.push(entry.content.$t);
        if (col === 5) {
          this.data.daily.push(tmp);
        }
      }
    }
    return this._loadComplete();
  };

  wizLoader._loadComplete = function() {
    this.data.count++;
    if (this.data.count === Object.keys(this.option.gridIds).length) {
      $("#overlay-loading").remove();
      $("#load-count").text('共讀取了 ' + (this.data.normal.length + this.data.sort.length + this.data.daily.length) + ' 個問題。');
    } else {
      $("#loaded-count").text(this.data.count + '/' + Object.keys(this.option.gridIds).length);
    }
  };

  wizLoader.htmlEncode = function(html) {
    return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML;
  };

  wizLoader.highlight = function(keyword, msg) {
    return msg.split(keyword).join("<b>" + keyword + "</b>");
  };

  wizLoader._initEvent = function() {
    $(".form").submit(function(e) {
      e.preventDefault();
      return false;
    });
    $(".from-source").on("change", function() {
      return $("#inputKeyword").trigger("keyup");
    });
    $("#result").on("click", ".btn-more", function() {
      var data, pos, text, tr, trOffset, type;
      tr = $(this).parents("tr");
      type = tr.data("type");
      pos = tr.data("pos");
      trOffset = tr.offset();
      data = {};
      text = '';
      if (type === 'normal') {
        data = wizLoader.data[type][pos];
        text = "題目顏色：" + data.color + "，題目類型：" + data.type + "，";
      } else if (type === 'daily') {
        data = {
          question: wizLoader.data[type][pos][1] + "，網址：" + wizLoader.data[type][pos][0],
          answer: wizLoader.data[type][pos][2]
        };
      } else {
        data = {
          question: wizLoader.data[type][pos][0],
          answer: wizLoader.data[type][pos].slice(1).join('、')
        };
      }
      text += "<a id=\"question-report\" href=\"javascript:void\" data-question=\"" + data.question + "\" data-answer=\"" + data.answer + "\">錯誤回報</a>";
      $("#question-info").css({
        top: trOffset.top,
        left: trOffset.left,
        width: tr.width(),
        height: tr.height()
      }).addClass("active");
      return $("#question-info .info div").html(text);
    });
    $("#question-info").on("click", ".btn-close", function() {
      return $("#question-info").removeClass("active");
    });
    $("#question-info").on("click", "#question-report", function() {
      var answer, question, url;
      question = encodeURIComponent($(this).data("question"));
      answer = encodeURIComponent($(this).data("answer"));
      url = "https://docs.google.com/forms/d/1GYyqSKOfF2KMkMGfEuKtyE8oZadgTRRj_ZClYZRX2Qc/viewform?entry.699244241=%E9%A1%8C%E7%9B%AE%EF%BC%9A" + question + "%0A%E5%8E%9F%E5%A7%8B%E7%AD%94%E6%A1%88%EF%BC%9A" + answer + "%0A%E6%AD%A3%E7%A2%BA%E7%AD%94%E6%A1%88%EF%BC%9A";
      $("#report-modal iframe").attr("src", url);
      return $('#report-modal').modal('show');
    });
    $("#inputKeyword").on("keyup", function() {
      var entry, index, val, _ref, _ref1, _ref2;
      val = $(this).val();
      $("#question-info").removeClass("active");
      $("#result").html("");
      if (val.length <= 0) {
        return;
      }
      val = val.toLowerCase();
      if ($("#fromNormal:checked").val() === '1') {
        _ref = wizLoader.data.normal;
        for (index in _ref) {
          entry = _ref[index];
          if (typeof entry.question === 'undefined') {
            console.debug(entry);
            continue;
          }
          if (entry.question.toLowerCase().indexOf(val) !== -1) {
            if (entry.question.toLowerCase().indexOf(val) !== -1) {
              $("#result").append('<tr data-pos="' + index + '" data-type="normal"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="question">' + wizLoader.highlight(val, entry.question) + '</div><div class="text-danger">' + wizLoader.htmlEncode(entry.answer) + '</div></td></tr>');
            }
          }
        }
      }
      if ($("#fromSort:checked").val() === '1') {
        _ref1 = wizLoader.data.sort;
        for (index in _ref1) {
          entry = _ref1[index];
          if (entry[0].toLowerCase().indexOf(val) !== -1) {
            $("#result").append('<tr><tr data-pos="' + index + '" data-type="sort"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="question">' + wizLoader.highlight(val, entry[0]) + '</div><div class="text-danger">' + wizLoader.htmlEncode(entry.slice(1).join('、')) + '</div></td></tr>');
          }
        }
      }
      if ($("#fromDaily:checked").val() === '1') {
        _ref2 = wizLoader.data.daily;
        for (index in _ref2) {
          entry = _ref2[index];
          if (entry[1].toLowerCase().indexOf(val) !== -1) {
            $("#result").append('<tr><tr data-pos="' + index + '" data-type="daily"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="col-sm-3"><img src="' + entry[0] + '" /></div><div class="col-sm-5">' + wizLoader.highlight(val, entry[1]) + '</div><div class="col-sm-4 text-danger">' + wizLoader.htmlEncode(entry[2]) + '</div></td></tr>');
          }
        }
      }
    });
  };

  wizLoader.init = function() {
    var entry, type, _ref;
    _ref = this.option.gridIds;
    for (type in _ref) {
      entry = _ref[type];
      this.addScript(entry);
    }
    this._initEvent();
  };

  return wizLoader;

})();
