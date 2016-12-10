var obj;

var totalObj;

function eraseHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var pid = sel.anchorNode.parentElement.id;
    var eraseIdx = -1;
    var erasePoint = range.startOffset;
    for (i = 0; i < obj[pid].length; i++) {
        if(obj[pid][i].start <= erasePoint && erasePoint <= obj[pid][i].end){
            eraseIdx = i;
        }
    }
    if(eraseIdx == 0){
        obj[pid].splice(0, 1, {
            start: 0,
            end: 0
        });
    }
    else if(eraseIdx != -1){
        obj[pid].splice(eraseIdx,1)
    }
    pushHighlights(pid);
    highlightJSON(pid);    
}

//JSON 기반으로 template HTML에 highlight넣어주는 함수
function highlightJSON(pid) {
    var len = obj[pid].length;
    var innerHTML = document.getElementById(pid).innerHTML;
    for (j = len - 2; j >= 0; j--) {
        var start = obj[pid][j].start;
        var end = obj[pid][j].end;
        innerHTML = innerHTML.substring(0, start) + "<span class='questionable'>" + innerHTML.substring(start, end) + "</span>" + innerHTML.substring(end);
    }
    var highlightPid = pid.replace("layer1","layer2");
    //console.log(highlightPid);
    document.getElementById(highlightPid).innerHTML = innerHTML;
}

//JSON 기반으로 template HTML에 highlight넣어주는 함수
function highlightTotalJSON() {
    var keys = Object.keys(totalObj);
    for(i=0;i<keys.length;i++){
        var pid = keys[i];
        var len = totalObj[pid].length;
        var innerHTML = document.getElementById(pid).innerHTML;
        for (j = len - 2; j >= 0; j--) {
            var start = totalObj[pid][j].start;
            var end = totalObj[pid][j].end;
            //console.log("DEBUG: "+j+ "  "+totalObj[pid][j].style.substring  (0,3));
            if(totalObj[pid][j].style.substring(0,4) == "grey"){
                console.log("DEBUG: "+totalObj[pid][j].style);
                var alpha = Number(totalObj[pid][j].style[4]) * 0.1;
                console.log("alpha: "+alpha);
                innerHTML = innerHTML.substring(0, start) + '<span style="point-bg">' + innerHTML.substring(start, end) + "</span>" + innerHTML.substring(end);
            }
            
        }
        var highlightPid = pid.replace("layer1","layer3");
        document.getElementById(highlightPid).innerHTML = innerHTML;
    }
}

//마우스 드래그로 선택시 JSON으로 변환해주는 함수
function selectToHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var pid = sel.anchorNode.parentElement.id;
    var pidEnd = sel.focusNode.parentElement.id;
    var paragraph = sel.anchorNode.parentElement;
    
    var selStart = range.startOffset;
    var selEnd = range.endOffset;
    if (pid != pidEnd) {
        return;
    }
    sel.removeAllRanges();
    console.log("pid: " + pid + "  selStart: "+selStart+"  selEnd: "+selEnd);
    var spliceIdx = 0; //splice시작하는 인덱스
    var spliceLength = 0; //새로운 항목 추가를 위해 삭제하는 엔트리 개수
    var startFix = false;
    var endFix = false;
    var newStart = selStart;
    var newEnd = selEnd;

    console.log(selStart + " " + selEnd);
    for (i = 0; i < obj[pid].length; i++) {
        console.log(i + "th " + obj[pid][i].start + " " + obj[pid][i].end);
        if (!startFix && obj[pid][i].start <= selStart) {
            if (obj[pid][i].end >= selStart) {
                newStart = obj[pid][i].start;
            }
        } else if (!startFix && obj[pid][i].start > selStart) {
            startFix = true;
        }
        if (!endFix && obj[pid][i].end >= selEnd) {
            if (obj[pid][i].start <= selEnd) {
                newEnd = obj[pid][i].end;
            }
            endFix = true;
        }
    }
    startFix = false;
    for (i = 0; i < obj[pid].length; i++) {
        if (!startFix && newStart <= obj[pid][i].start) {
            spliceIdx = i;
            startFix = true;
        }
        if (newEnd >= obj[pid][i].end) {
            spliceLength = i + 1;
        }
    }
    spliceLength -= spliceIdx;

    obj[pid].splice(spliceIdx, spliceLength, {
        start: newStart,
        end: newEnd
    });
    console.log(spliceIdx + " " + spliceLength + " " + newStart + " " + newEnd + " " + obj[pid].length);
    pushHighlights(pid);
    highlightJSON(pid);
}

var highlightMode = true;
function setHighlightMode(){
    // @영보 mode 정보 JSON에 넣기
    highlightMode = true;
    console.log("Mode: Highlight");
}
function setEraserMode(){
    // @영보 mode 정보 JSON에 넣기
    highlightMode = false;
    console.log("Mode: Eraser");
}

function modeSelect(){
    if(highlightMode){
        selectToHighlight();
    }
    else{
        eraseHighlight();
    }
}

 function loadHighlights()
{
    //highlightTotalJSON();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //get json of all highlights and draw them accordingly
            alert("placeholder alert." + this.responseText);
            var loadedJson = JSON.parse(this.responseText);
            if(loadedJson.ok){
                console.log("Load complete!");
                obj = loadedJson.content;
                //obj = JSON.parse(obj);
                console.log(JSON.stringify(obj));
                var keys = Object.keys(obj);
                for(i=0;i<keys.length;i++){
                    //console.log("idx: "+i);
                    var pid = keys[i];
                    highlightJSON(pid);
                }
            }
            else{
                console.log("Load Error");
            }
        }
    };
    xhttp.open("POST", "/loadHighlight", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
    xhttp.send("total=0&pid=1");
}

function pushHighlights(pid){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Push done");
        }
    };
    xhttp.open("POST", "/updateHighlight", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
    xhttp.send("pid="+pid+"&content="+JSON.stringify(obj));
}