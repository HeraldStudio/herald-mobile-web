WS_BASE_URL = "http://herald.seu.edu.cn/ws";

COOKIE_TYX_USER = "tyx_user";
COOKIE_TYX_PASS = "tyx_pass";
COOKIE_ID_CARD = "id_card";
COOKIE_CURRICULUM = "curriculum";

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
}

function deleteCookie(c_name) {
    document.cookie = c_name + "=; Max-Age=0";
}

function initComponents() {
    var tyxUser = getCookie(COOKIE_TYX_USER);
    if (tyxUser != null) {
        setCookie(COOKIE_TYX_USER, tyxUser, 3);
        $("#username").val(tyxUser);
    }
    var tyxPass = getCookie(COOKIE_TYX_PASS);
    if (tyxPass != null) {
        setCookie(COOKIE_TYX_PASS, tyxPass, 3);
        $("#password").val(tyxPass);
    }
    if (tyxUser != null && tyxPass != null) {
        $("#tyxLnk .ui-btn-text").text("体育系登录（已登录）");
    }

    var idCard = getCookie(COOKIE_ID_CARD);
    if (idCard != null) {
        setCookie(COOKIE_ID_CARD, idCard, 3);
        $("#idcard").val(idCard);
    }
    if (idCard != null) {
        $("#idCardLnk .ui-btn-text").text("一卡通设置（已设置）");
    }

    
    $("#saveTyx").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        setCookie(COOKIE_TYX_USER, username, 3);
        setCookie(COOKIE_TYX_PASS, password, 3);
        location.reload();
    });
    
    $("#saveIdCard").click(function() {
        var idCard = $("#idcard").val();
        setCookie(COOKIE_ID_CARD, idCard, 3);
        deleteCookie(COOKIE_CURRICULUM);
        location.reload();
    });
}

function hint(msg) {
    $("#hintInfo").text(msg);
    $("#hintLnk").trigger("click");
}

function getRuntime() {
    var tyxUser = getCookie(COOKIE_TYX_USER);
    var tyxPass = getCookie(COOKIE_TYX_PASS);
    if (tyxUser == null || tyxPass == null) {
        hint("请在“设置”中登录你的体育系账户");
        return;
    }
    $.mobile.loading("show");
    $.get("http://herald.seu.edu.cn/herald_web_service/tyx/" + tyxUser + "/" + tyxPass + "/",
    function(data) {
        if (!$.isNumeric(data)) {
            hint(data);
        } else {
            $("#timesData").text(data);
        }
    }).fail(function() {
        hint("跑操次数获取失败");
    }).always(function() {
        $.mobile.loading("hide");
    });
}

function getRemainDays() {
    $.get(WS_BASE_URL + "/exercise/remain", function(data) {
        if (data && $.isNumeric(data)) {
            $("#exercise-remain").text(data);
        }
    });
}

function getJwcInfo() {
    $.mobile.loading("show");
    $("#jwcTitle").nextAll('li').remove();
    $.get(WS_BASE_URL + "/campus/jwc", function(data) {
        var info = data.info;
        $("#jwcCount").text(info.length || 0);
        for (var i = 0; i < info.length; ++i) {
            var e = info[i];
            var title = e.title;
            var href = e.href;
            var time = "";
            $("#infoList li:last-child").after(
                "<li><a href=\"" + href + "\"><p><strong>" + time + "</strong></p><h2>" + title + "</h3></a></li>");
        }
        $("#infoList").listview("refresh");
    }).fail(function() {
        hint("教务处信息获取失败");
    }).always(function() {
        $.mobile.loading("hide");
    });
}

function getCurriculum(index) {
    var idCard = getCookie(COOKIE_ID_CARD);
    if (idCard == null) {
        hint("请在“设置”中设置你的一卡通");
        return;
    }

    $.mobile.loading("show");
    var renderCurriculum = function(data, index) {
        $("#curriculum").empty();
        var each = data[index];
        if (each == null || data[index].courses.length == 0) {
            var appendHtml = "<li><h2>没课你敢信？</h2></li>"
            $("#curriculum").append(appendHtml);
            $("#curriculum").listview("refresh");
            return;
        }
        var courses = data[index].courses;
        var size = courses.length;
        for (var i = 0; i < size; ++i) {
            var course = courses[i];
            var name = course.name;
            var time = course.time;
            var location = course.location;
            var strategy = course.strategy;
            var strategyHtml = "";
            if (strategy == "ODD") {
                strategyHtml = "<span class=\"strategy\">(单周)</span>";
            } else if (strategy == "EVEN") {
                strategyHtml = "<span class=\"strategy\">(双周)</span>";
            }
            var appendHtml = "<li><a href=\"#\"><p>" + time +
                "</p><h2>" + name + strategyHtml +
                "</h2><p>" + location + "</p></a></li>";
            $("#curriculum").append(appendHtml);
        }
        $("#curriculum").listview("refresh");
    }
    var curriculum = getCookie(COOKIE_CURRICULUM);
    if (curriculum != null) {
        renderCurriculum($.parseJSON(curriculum), index);
        $.mobile.loading("hide");
        return;
    }
    $.get(WS_BASE_URL + "/curriculum/" + idCard, function(data) {
        setCookie(COOKIE_CURRICULUM, JSON.stringify(data), 1);
        renderCurriculum(data, index);
    }).fail(function() {
        hint("课表查询失败");
    }).always(function() {
        $.mobile.loading("hide");
    });
}