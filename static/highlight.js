    var Content = { p1: "We explore the use of modern recommender system technology to address the problem of learning software applications. Before describing our new command recommender system, we first define relevant design considerations. We then discuss a 3 month user study we conducted with professional users to evaluate our algorithms which generated customized recommendations for each user. Analysis shows that our item-based collaborative filtering algorithm generates 2.1 times as many good suggestions as existing techniques. In addition we present a prototype user interface to ambiently present command recommendations to users, which has received promising initial user feedback.", p2: "Many of today’s programs have not hundreds, but thousands of commands for a user to become aware of and learn [18]. In each release, more commands might be added, and without explicit effort on the part of the user to learn about new functionality, they are left untouched. For example, in Autodesk's AutoCAD, the number of commands has being growing linearly over time. And even with the thousands of commands available in AutoCAD, the largest group of users only use between 31 and 40 of them (Figure 1).", p3: "An inherent challenge with such systems is a user’s awareness [14, 39] of the functionality which is relevant to their specific goals and needs. Awareness of functionality is not only important for learning how to accomplish new tasks, but also learning how to better accomplish existing tasks. In a potential “best case scenario”, the user works with an expert next to them, who can recommend commands when appropriate.", p4: "While previous HCI literature has looked at intelligent online agents, most of this work is focused on predicting what current state a user is in, if they require assistance, and how", p5: "to overcome problems [4, 8, 9, 15, 17, 20, 31]. To our knowledge, here are few examples of systems specifically focused on recommending new commands to users [24, 25]. Furthermore, such work has never been thoroughly implemented or evaluated, and has important limitations.", p6: "Systems which recommend content to users, known as “recommender systems” are very popular today in other domains. Some of the most popular movie, shopping, and music websites provide users with personalized recommendations [23, 29, 34, 36], and research in improving recommendation algorithms is an active field of research [2]. In this paper we introduce and investigate the application of modern recommender system algorithms to address the ommand awareness problem in software applications. ", p7: "Our new system, CommunityCommands, collects usage data from a software system’s user community, and applies recommender system algorithms to generate personalized command recommendations to each user. With CommunityCommands we hope to expose users to commands they are not currently familiar with that will help them use the software more effectively. The recommended commands are displayed in a peripheral tool palette within the user interface that the user to refer to when convenient. Thus, the system is much more ambient in nature compared to online agents such as “Clippy” or even simple techniques like “Tip of the Day”. After discussing implementation details, we describe a 3 month evaluation of our recommender system algorithms, conducted with real users. Our new algorithms provided significantly improved recommendations in comparison to existing approaches." };;
var obj = {
    "p1l1p1":[{"start":0,"end":0,"style":"highlight"},{"start":679,"end":679,"style":"highlight"}],
    "p1l1p2":[{"start":0,"end":0,"style":"highlight"},{"start":507,"end":507,"style":"highlight"}],
    "p1l1p3":[{"start":0,"end":0,"style":"highlight"},{"start":421,"end":421,"style":"highlight"}],
    "p1l1p4":[{"start":0,"end":0,"style":"highlight"},{"start":183,"end":183,"style":"highlight"}],
    "p1l1p5":[{"start":0,"end":0,"style":"highlight"},{"start":274,"end":274,"style":"highlight"}],
    "p1l1p6":[{"start":0,"end":0,"style":"highlight"},{"start":494,"end":494,"style":"highlight"}],
    "p1l1p7":[{"start":0,"end":0,"style":"highlight"},{"start":873,"end":873,"style":"highlight"}],
};

function loadContents() {
    //Hardcoded... 실제 논문 내용들
    Content = { p1: "We explore the use of modern recommender system technology to address the problem of learning software applications. Before describing our new command recommender system, we first define relevant design considerations. We then discuss a 3 month user study we conducted with professional users to evaluate our algorithms which generated customized recommendations for each user. Analysis shows that our item-based collaborative filtering algorithm generates 2.1 times as many good suggestions as existing techniques. In addition we present a prototype user interface to ambiently present command recommendations to users, which has received promising initial user feedback.", p2: "Many of today’s programs have not hundreds, but thousands of commands for a user to become aware of and learn [18]. In each release, more commands might be added, and without explicit effort on the part of the user to learn about new functionality, they are left untouched. For example, in Autodesk's AutoCAD, the number of commands has being growing linearly over time. And even with the thousands of commands available in AutoCAD, the largest group of users only use between 31 and 40 of them (Figure 1).", p3: "An inherent challenge with such systems is a user’s awareness [14, 39] of the functionality which is relevant to their specific goals and needs. Awareness of functionality is not only important for learning how to accomplish new tasks, but also learning how to better accomplish existing tasks. In a potential “best case scenario”, the user works with an expert next to them, who can recommend commands when appropriate.", p4: "While previous HCI literature has looked at intelligent online agents, most of this work is focused on predicting what current state a user is in, if they require assistance, and how", p5: "to overcome problems [4, 8, 9, 15, 17, 20, 31]. To our knowledge, here are few examples of systems specifically focused on recommending new commands to users [24, 25]. Furthermore, such work has never been thoroughly implemented or evaluated, and has important limitations.", p6: "Systems which recommend content to users, known as “recommender systems” are very popular today in other domains. Some of the most popular movie, shopping, and music websites provide users with personalized recommendations [23, 29, 34, 36], and research in improving recommendation algorithms is an active field of research [2]. In this paper we introduce and investigate the application of modern recommender system algorithms to address the ommand awareness problem in software applications. ", p7: "Our new system, CommunityCommands, collects usage data from a software system’s user community, and applies recommender system algorithms to generate personalized command recommendations to each user. With CommunityCommands we hope to expose users to commands they are not currently familiar with that will help them use the software more effectively. The recommended commands are displayed in a peripheral tool palette within the user interface that the user to refer to when convenient. Thus, the system is much more ambient in nature compared to online agents such as “Clippy” or even simple techniques like “Tip of the Day”. After discussing implementation details, we describe a 3 month evaluation of our recommender system algorithms, conducted with real users. Our new algorithms provided significantly improved recommendations in comparison to existing approaches." };
}

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
    highlightJSON(pid);    
}

//span을 기준으로 JSON을 생성해준다.
function spanToJSON(pid) {
    loadContents();
    var spannedHTML = document.getElementById(pid).innerHTML;
    var originalHTML = Content[pid];
    var startIdx = 1;
    var endIdx = 1;
    startIdx = spannedHTML.indexOf('<span class="highlight">');
    while (startIdx != -1) {
        spannedHTML = spannedHTML.replace('<span class="highlight">', "");
        endIdx = spannedHTML.indexOf('</span>');
        spannedHTML = spannedHTML.replace('</span>', "");
        startIdx++;
        endIdx++;
        //TODO: JSON에 추가하기
        //userJSON[pid].push({"start":'+startIdx+',"end":'+endIdx+'});
        console.log('{"start":' + startIdx + ',"end":' + endIdx + '}');
        startIdx = spannedHTML.indexOf('<span class="highlight">');
    }
}

//JSON 기반으로 template HTML에 highlight넣어주는 함수
function highlightJSON(pid) {
    var len = obj[pid].length;
    console.log("length: " + len);
    var innerHTML = document.getElementById(pid).innerHTML;
    for (j = len - 2; j >= 0; j--) {
        var start = obj[pid][j].start;
        var end = obj[pid][j].end;
        innerHTML = innerHTML.substring(0, start) + "<span class='highlight'>" + innerHTML.substring(start, end) + "</span>" + innerHTML.substring(end);
    }
    var highlightPid = pid.replace("l1","l2");
    console.log("layerpid: "+highlightPid);
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
                console.log(JSON.stringify(obj));
            }
            else{
                console.log("Load Error");
            }
        }
    };
    xhttp.open("POST", "/loadHighlight", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
    xhttp.send("total=1&pid=1");
}
