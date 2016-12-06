var Content;

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
    if (range.startContainer.isSameNode(range.endContainer) && range.startOffset == range.endOffset) {
        var element = range.startContainer.parentElement;
        if (element != null) {
            var outerHTML = element.outerHTML;
            if (outerHTML.indexOf('<span class="highlight">')) {
                outerHTML.replace('<span class="highlight">', "");
                outerHTML.replace('</span>', "");
            }
            element.outerHTML = outerHTML;
        }
    }
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

function highlighter() {
    surroundHighlight();
    spanToJSON();
}

function eraser() {
    eraseHighlight();
    spanToJSON();
}

var highlightMode = true;

function setHighlightMode() {
    // @영보 mode 정보 JSON에 넣기
    highlightMode = true;
}

function setEraserMode() {
    // @영보 mode 정보 JSON에 넣기
    highlightMode = false;
}

function modeSelect() {
    if (highlightMode) {
        highlighter();
    } else {
        eraser();
    }
}

//currently unused.
var sendID = function() {
    var userid = document.getElementById("userid").value;
    var url = "/view"
    var params = "uid=" + userid + "&pid=0&high=0";
    var http = new XMLHttpRequest();
    var welcomeString = "  Hi, " + userid + ". Let's read!";
    http.open("POST", url + "?" + params, true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
        }
    }
    http.send(null);
    $(document).ready(function() {
        $("#userid").val(welcomeString);
        $("#loginbutton").html(":)");
    });
}

function loadHighlights() {
    //code doesn't work
    return;
    var uid = {
        { session.id } };
    var pid = 0
    document.getElementById("")
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //get json of all highlights and draw them accordingly
            alert("placeholder alert." + this.responseText);
            //document.getElementById("demo").innerHTML = this.responseText;
        }
    };
    xhttp.open("POST", "{{url_for('loadHighlights')}}", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("uid=" + uid + "&pid=" + pid);
}
