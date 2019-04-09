/**
 * Created by xiyuan_fengyu on 2016/11/10.
 */
function toStr(json, doReplace) {
    var tempStr = "";
    for (var key in json) {
        var value = json[key];
        tempStr += "\"" + key + "\": ";
        if (value == null) {
            tempStr += "null, ";
        }
        else if (typeof value == "string") {
            tempStr += "\"" + value + "\", "
        }
        else if (typeof value == "object") {
            tempStr += toStr(value, false) + ", ";
        }
        else {
            tempStr += value + ", "
        }
    }
    if (tempStr != "") {
        tempStr = tempStr.substring(0, tempStr.length - 2);
    }

    if (doReplace != false) {
        var replaceStr = "";
        for (var i = 0; i < tempStr.length; i++) {
            var charCode = tempStr.charCodeAt(i);
            if (charCode == 10) {
                replaceStr += "\\n";
            }
            else if (charCode == 13) {
                replaceStr += "\\r";
            }
            else {
                replaceStr += tempStr[i];
            }
        }
        tempStr = replaceStr;
    }
    return "{" + tempStr + "}";
}

module.exports = {
    toStr: toStr
};