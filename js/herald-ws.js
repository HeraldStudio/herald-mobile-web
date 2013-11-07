COOKIE_TYX_USER = "tyx_user";
COOKIE_TYX_PASS = "tyx_pass";
COOKIE_ID_CARD = "id_card";

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
        $("#tyxLoginLnk").text("体育系登录（已登录）");
    }

    var idCard = getCookie(COOKIE_ID_CARD);
    if (idCard != null) {
        setCookie(COOKIE_ID_CARD, idCard, 3);
        $("#idcard").val(idCard);
    }
    if (idCard != null) {
        $("#idCardLnk").text("一卡通设置（已设置）");
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
        location.reload();
    });

    $(document).swipeleft(function() {
        $("#login-panel").panel("open");
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
        $("#tyxLnk").trigger("click");
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

function getJwcInfo() {
    $.mobile.loading("show");
    $("#jwcTitle").nextAll('li').remove();
    $.get("http://herald.seu.edu.cn/ws/campus/jwc", function(data) {
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