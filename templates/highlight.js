//클릭 selection을 둘러싸는 span을 만들어준다.
//문제점: highlight 된 부분과 안 된 부분을 포함하는 selection에는 적용이 되지 않는다.
function surroundHighlight() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    console.log("start: " + range.startContainer + "  End: " + range.endContainer);
    var newNode = document.createElement("span");
    var att = document.createAttribute("class");
    att.value = "highlight";
    newNode.setAttributeNode(att);
    range.surroundContents(newNode);
}

//span을 기준으로 JSON을 생성해준다.
function spanToJSON(){
    
}