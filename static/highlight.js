var obj = [0,0,0,0];
var highlightMode = true;
var toolNum = 0;
var className = ["point", "like", "dislike", "questionable", "point-bg", "like-bg", "dislike-bg", "questionable-bg"];
var totalObj;

function eraseHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var pid = sel.anchorNode.parentElement.id;
    var eraseIdx = -1;
    var erasePoint = range.startOffset;
    for(allNum = 0;allNum<4;allNum++){
        for (i = 0; i < obj[allNum][pid].length; i++) {
            if(obj[allNum][pid][i].start <= erasePoint && erasePoint <= obj[allNum][pid][i].end){
                eraseIdx = i;
            }
        }
        if(eraseIdx == 0){
            obj[allNum][pid].splice(0, 1, {
                start: 0,
                end: 0
            });
        }
        else if(eraseIdx != -1){
            obj[allNum][pid].splice(eraseIdx,1)
        }
    }
    pushHighlights(pid);
    for(i = 2;i<=5;i++){
        highlightJSON(pid,i); 
    }   
}

//JSON 기반으로 template HTML에 highlight넣어주는 함수
function highlightJSON(pid, layerNum) {
    console.log("pid: " + pid + "  layerNum: " + layerNum);
    var len = obj[layerNum-2][pid].length;
    console.log("len: " + len);
    var innerHTML = document.getElementById(pid).innerHTML;
    for (j = len - 2; j >= 0; j--) {
        var start = obj[layerNum-2][pid][j].start;
        var end = obj[layerNum-2][pid][j].end;
        innerHTML = innerHTML.substring(0, start) + "<span class='"+className[layerNum-2]+"'>" + innerHTML.substring(start, end) + "</span>" + innerHTML.substring(end);
    }
    console.log("innerHTML: " + innerHTML);
    var highlightPid = pid.replace("layer1","layer"+layerNum);
    console.log("highlightPid: " + highlightPid);
    console.log("null?: " + document.getElementById(highlightPid).innerHTML);
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
    for (i = 0; i < obj[toolNum][pid].length; i++) {
        console.log(i + "th " + obj[toolNum][pid][i].start + " " + obj[toolNum][pid][i].end);
        if (!startFix && obj[toolNum][pid][i].start <= selStart) {
            if (obj[toolNum][pid][i].end >= selStart) {
                newStart = obj[toolNum][pid][i].start;
            }
        } else if (!startFix && obj[toolNum][pid][i].start > selStart) {
            startFix = true;
        }
        if (!endFix && obj[toolNum][pid][i].end >= selEnd) {
            if (obj[toolNum][pid][i].start <= selEnd) {
                newEnd = obj[toolNum][pid][i].end;
            }
            endFix = true;
        }
    }
    startFix = false;
    for (i = 0; i < obj[toolNum][pid].length; i++) {
        if (!startFix && newStart <= obj[toolNum][pid][i].start) {
            spliceIdx = i;
            startFix = true;
        }
        if (newEnd >= obj[toolNum][pid][i].end) {
            spliceLength = i + 1;
        }
    }
    spliceLength -= spliceIdx;

    obj[toolNum][pid].splice(spliceIdx, spliceLength, {
        start: newStart,
        end: newEnd
    });
    console.log(spliceIdx + " " + spliceLength + " " + newStart + " " + newEnd + " " + obj[toolNum][pid].length);
    pushHighlights(pid);
    highlightJSON(pid, toolNum+2);
}

function setHighlightMode(num){
    // @영보 mode 정보 JSON에 넣기
    toolNum = num;
    highlightMode = true;
    console.log("Mode: Highlight" + toolNum);
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
            for(objNum=0;objNum<4;objNum++){
                var loadedJson = JSON.parse(this.responseText);
                if(loadedJson.ok){
                    console.log("Load complete!");
                    obj[objNum] = loadedJson.content;
                    //obj = JSON.parse(obj);
                    //console.log(JSON.stringify(obj));
                    var keys = Object.keys(obj[objNum]);
                    for(i=0;i<keys.length;i++){
                        var pid = keys[i];
                        console.log("pid: "+pid) ;
                        highlightJSON(pid, objNum + 2);
                    }
                }
                else{
                    console.log("Load Error");
                }
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
    xhttp.send("pid="+pid+"&content="+JSON.stringify(obj[toolNum]));
}