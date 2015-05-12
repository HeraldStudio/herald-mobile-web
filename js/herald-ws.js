WS_BASE_URL = "http://herald.seu.edu.cn/api";
WS_AUTH_URL = "http://herald.seu.edu.cn/uc";
WS_APPID = "9f9ce5c3605178daadc2d85ce9f8e064";

COOKIE_UUID = "user_uuid";
COOKIE_STU_NUM = "stu_num";
COOKIE_TYX_PASS = "tyx_pass";
COOKIE_ID_CARD = "id_card";
COOKIE_ID_PASS = "id_pass";
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
    var stuNum = getCookie(COOKIE_STU_NUM);
    if (stuNum != null) {
        setCookie(COOKIE_STU_NUM, stuNum, 3);
        $("#username").val(stuNum);
    }
    var tyxPass = getCookie(COOKIE_TYX_PASS);
    if (tyxPass != null) {
        setCookie(COOKIE_TYX_PASS, tyxPass, 3);
        $("#password").val(tyxPass);
    }

    var idCard = getCookie(COOKIE_ID_CARD);
    if (idCard != null) {
        setCookie(COOKIE_ID_CARD, idCard, 3);
        $("#idcard").val(idCard);
    }

    var cardPass = getCookie(COOKIE_ID_PASS);
    if (cardPass != null){
        setCookie(COOKIE_ID_PASS, cardPass, 3);
        $("#cardpass").val(cardPass);
    }

    if (idCard != null && cardPass != null) {
        $("#idCardLnk .ui-btn-text").text("一卡通登陆（已登陆）");
    }
    
    $("#saveInfo").click(function() {
        var stuNum = $("#username").val();
        var tyxPass = $("#password").val();
        setCookie(COOKIE_STU_NUM, stuNum, 3);
        setCookie(COOKIE_TYX_PASS, tyxPass, 3);
        deleteCookie(COOKIE_CURRICULUM);
        $.ajax({
            type: "post",
            url: WS_AUTH_URL + "/update",
            data: {
                cardnum: idCard,
                password: cardPass,
                number: stuNum,
                pe_password: tyxPass,
                lib_username: idCard,
                lib_password: idCard,
            },
            dataType: "text",
            success: function(data){
                if (data != null){
                    location.reload();
                }
            },
            error: function(){
                alert("更新信息失败，请检查信息是否正确");
            }
        })
    });
    
    $("#saveIdCard").click(function() {
        var idCard = $("#idcard").val();
        var cardPass = $("#cardpass").val();
        setCookie(COOKIE_ID_CARD, idCard, 3);
        setCookie(COOKIE_ID_PASS, cardPass, 3);
        deleteCookie(COOKIE_CURRICULUM);
        $.ajax({
            type: "post",
            url: WS_AUTH_URL + "/auth",
            data: {
                user: idCard,
                password: cardPass,
                appid: WS_APPID
            },
            dataType: "text",
            success: function(data){
                if (data != null){
                    setCookie(COOKIE_UUID, data, 365);//默认365天
                    location.reload();
                }
            },
            error: function(){
                alert("登陆失败，请检查一卡通和密码");
            }
        });
    });
    
    $("a.app-inner").on("click", function(event) {
        event.preventDefault();
        var href = $(this).attr("href");
        window.location = href;
    });
}

function hint(msg) {
    $("#hintInfo").text(msg);
    $("#hintLnk").trigger("click");
}

function getRuntime() {
    var uuid = getCookie(COOKIE_UUID);
    if (uuid == null) {
        $("#idCardPopup").popup("open");
        return;
    }

    $.mobile.loading("show");
    $.ajax({
        type: "post",
        url: WS_BASE_URL + "/pe",
        data: {uuid: COOKIE_UUID},
        dataType: "json",
        success: function(data) {
            if (data.content && $.isNumeric(data.content)) {
                $("#timesData").text(data.content);
            } else {
                hint(data);
            }
        },
        error: function() {
            hint("跑操次数获取失败");
        },
        complete: function() {
            $.mobile.loading("hide");
        }
    });
}

function getRunPredict() {
    $.ajax({
        type: "post",
        url: WS_BASE_URL + "/pc",
        data: {uuid: COOKIE_UUID},
        dataType: "json",
        success: function(data) {
            if (data.content && !$.isNumeric(data.content)) {
                $("#exercise-predict").text(data.content);
            }
            else{
                $("#exercise-predict").text("今天还没有预测哦");
            }
        },
        error: function() {
            $("#exercise-predict").text("今天还没有预测哦");
        },
        complete: function() {
            $.mobile.loading("hide");
        }
    });
}

function getJwcInfo() {
    var uuid = getCookie(COOKIE_UUID);
    if (uuid == null) {
        $("#idCardPopup").popup("open");
        return;
    }

    $.mobile.loading("show");
    $("#jwcTitle").nextAll('li').remove();
    $.ajax({
        type: "post",
        url: WS_BASE_URL + "/jwc",
        data: {uuid: COOKIE_UUID},
        dataType: "json",
        success: function(data) {
            var info = data.content;
            $("#jwcCount").text(info.length || 0);
            var infoArray = Object.keys(info);
            for (var i = 0; i < infoArray.length; ++i){
                var current = info[infoArray[i]];
                for (var j = 0; j < current.length; ++j){
                    var e = current[j];
                    var title = e.title;
                    var href = e.href;
                    var time = "";
                    $("#infoList li:last-child").after(
                        "<li><a href=\"" + href + "\"><p><strong>" + time + "</strong></p><h2>" + title + "</h3></a></li>");
                }
            }
            $("#infoList").listview("refresh");
        },
        error: function() {
            hint("教务处信息获取失败");
        },
        complete: function() {
            $.mobile.loading("hide");
        }
    });
}

function getCurriculum(index) {
    var uuid = getCookie(COOKIE_UUID);
    if (uuid == null) {
        $("#idCardPopup").popup("open");
        return;
    }

    $.mobile.loading("show");
    var renderCurriculum = function(data, index) {
        $("#curriculum").empty();
        var each = data[index];
        if (each == null || each.length == 0) {
            var appendHtml = "<li><h2>没课你敢信？</h2></li>"
            $("#curriculum").append(appendHtml);
            $("#curriculum").listview("refresh");
            return;
        }
        for (var i = 0; i < each.length; ++i){
            var course = each[i];
            var name = course[0];
            var time = course[1];
            var location = course[2];
            var strategy = location.substring(0,3);//单双周
            var strategyHtml = "";
            if (strategy == "(单)") {
                location = location.substring(3,location.length);//截取除了单周外的字
                strategyHtml = "<span class=\"strategy\">(单周)</span>";
            } else if (strategy == "(双)") {
                location = location.substring(3,location.length);//截取除了双周外的字
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
    $.ajax({
        type: "post",
        url: WS_BASE_URL + "/curriculum",
        data: {uuid:COOKIE_UUID},
        dataType: "json",
        success: function(data) {
            if (data.content){
                setCookie(COOKIE_CURRICULUM, JSON.stringify(data.content), 1);
                renderCurriculum(data.content, index);
            }
            else{
                hint("课表查询失败");
            }
        },
        error: function() {
            hint("课表查询失败");
        },
        complete: function() {
            $.mobile.loading("hide");
        }
    });
}