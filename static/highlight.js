var obj = {
    "p1l1p1":[{"start":0,"end":0,"style":"highlight"},{"start":679,"end":679,"style":"highlight"}],
    "p1l1p2":[{"start":0,"end":0,"style":"highlight"},{"start":507,"end":507,"style":"highlight"}],
    "p1l1p3":[{"start":0,"end":0,"style":"highlight"},{"start":421,"end":421,"style":"highlight"}],
    "p1l1p4":[{"start":0,"end":0,"style":"highlight"},{"start":183,"end":183,"style":"highlight"}],
    "p1l1p5":[{"start":0,"end":0,"style":"highlight"},{"start":274,"end":274,"style":"highlight"}],
    "p1l1p6":[{"start":0,"end":0,"style":"highlight"},{"start":494,"end":494,"style":"highlight"}],
    "p1l1p7":[{"start":0,"end":0,"style":"highlight"},{"start":873,"end":873,"style":"highlight"}]
};

//Json파일 불러오기
function loadJSON(uid) {
    var clientTotal = new XMLHttpRequest();
    clientTotal.open('GET', '/templates/TotalHighlight.json');
    clientTotal.onreadystatechange = function() {
        var totalJSONtxt = clientTotal.responseText;
    }
    clientTotal.send();
    var clientUser = new XMLHttpRequest();
    clientUser.open('GET', '/templates/' + uid + '.json');
    clientTotal.onreadystatechange = function() {
        var userJSONtxt = clientUser.responseText;
    }
    clientUser.send();

    totalJSON = JSON.parse(totalJSONtxt);
    userJSON = JSON.parse(userJSONtxt);
}

//클릭 selection을 둘러싸는 span을 만들어준다.
//문제점: highlight 된 부분과 안 된 부분을 포함하는 selection에는 적용이 되지 않는다.
function surroundHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    console.log("start: " + range.startOffset + "  End: " + range.endOffset);
    if (range.startContainer.isSameNode(range.endContainer) && range.startOffset == range.endOffset) {
        console.log("same node");
        return;
    }
    var newNode = document.createElement("span");
    var att = document.createAttribute("class");
    att.value = "highlight";
    newNode.setAttributeNode(att);
    range.surroundContents(newNode);
}

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
        innerHTML = innerHTML.substring(0, start) + "<span class='highlight'>" + innerHTML.substring(start, end) + "</span>" + innerHTML.substring(end);
    }
    var highlightPid = pid.replace("l1","l2");
    document.getElementById(highlightPid).innerHTML = innerHTML;
}
//마우스 드래그로 선택시 JSON으로 변환해주는 함수
function selectToHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var pid = sel.anchorNode.parentElement.id;
    var paragraph = sel.anchorNode.parentElement;
    
    var selStart = range.startOffset;
    var selEnd = range.endOffset;
    if (pid != sel.focusNode.parentElement.id) {
        return;
    }
    sel.removeAllRanges();
    console.log("selStart: "+selStart+"  selEnd: "+selEnd);
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
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //get json of all highlights and draw them accordingly
            alert("placeholder alert." + this.responseText);
            var loadedJson = JSON.parse(this.responseText);
            if(loadedJson.ok){
                console.log("Load complete!");
                obj = loadedJson.content;
                obj = JSON.parse(obj);
                console.log(JSON.stringify(obj));
                var keys = Object.keys(obj);
                for(i=0;i<keys.length;i++){
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
            log.console("Push done");
        }
    };
    xhttp.open("POST", "/updateHighlight", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
    xhttp.send("pid="+pid+"&content="+JSON.stringify(obj));
}