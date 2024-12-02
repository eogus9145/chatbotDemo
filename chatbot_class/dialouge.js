class Dialogue {
    constructor(option) {
        this.target = option.target;
        this.currentCategoryIdx = 0;
    }

    async init() {
        await this.elementInit();

        let targetElement = document.querySelector(this.target);
        if(!targetElement) {
            throw new Error("target이 존재하지 않습니다.");
        }
        targetElement.replaceWith(this.dialogueContainer);
    }

    async setCategory () {
        let dialogueRes = await fetch("/getDialogue");
        let dialogueJson = await dialogueRes.json();
        this.dialogue = dialogueJson.dialogue;

        let callbackRes = await fetch("/getCallback");
        let callbackJson = await callbackRes.json();
        this.callbackMapper = callbackJson.callbackMapper;

        this.dialogueCategory.innerHTML = "";
        Object.entries(this.dialogue).map(async ([callback, textArr], idx) => {
            let callbackName = this.callbackMapper[callback];
            let categoryBtn = this.createCategoryBtn(callbackName);
            this.dialogueCategory.appendChild(categoryBtn);

            categoryBtn.addEventListener("click", async (e) => {
                this.currentCategoryIdx = idx;
                this.setActive(categoryBtn);
                await this.setContent(textArr);
            });

            if(idx == this.currentCategoryIdx) {
                this.setActive(categoryBtn);
                await this.setContent(textArr);
            }

        });
    }

    createCategoryBtn (callbackName) {
        let categoryBtn = document.createElement("button");
        categoryBtn.classList.add("category");
        this.applyStyle(categoryBtn, {
            border: "none",
            outline: "none",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            backgroundColor: "#fff",
            color: "#444",
            letterSpacing: "-1px",
            cursor: "pointer",
        });
        categoryBtn.textContent = callbackName;
        return categoryBtn;
    }
    
    async setContent (textArr) {
        this.dialogueContentBoardTbody.innerHTML = "";
        for(let i=0; i<textArr.length; i++) {
            let tr = await this.createRow(i, textArr[i]);
            this.dialogueContentBoardTbody.appendChild(tr);
        }
        this.dialogueContentBoardDiv.scrollTop = this.dialogueContentBoardDiv.scrollHeight;
    }

    async createRow (i, text) {
        let tr = document.createElement("tr");

        let qInput = document.createElement("input");
        qInput.type = 'text';
        qInput.spellcheck = false;
        qInput.classList.add("qInput");
        this.applyStyle(qInput, {
            width: "100%",
            height: "30px",
            padding: "0.5rem",
            border: "none",
            outline: "none",
        });
        qInput.addEventListener("focusin", (e) => {
            this.applyStyle(qInput, {outline: "1px solid #ccc"});
        });
        qInput.addEventListener("focusout", (e) => {
            this.applyStyle(qInput, {outline: "none"});
        });
        qInput.value = text;

        let mod = document.createElement("button");
        this.applyStyle(mod, {
            fontSize: "0.75rem",
            width: "40px",
            height: "30px",
            border: "none",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            cursor: "pointer",
        });
        mod.textContent = "수정";
        mod.addEventListener("click", async (e) => {
            if(confirm("수정 하시겠습니까?")) {
                let response = await fetch("/modDialogue", {
                    method: "POST",
                    body: JSON.stringify({callbackIdx: this.currentCategoryIdx, idx: i, q: qInput.value}),
                    headers: {"Content-Type":"application/json"}
                });
                let result = await response.json();
                alert(result.msg);
                if(result.cd == '0000') {
                    await this.setCategory();
                }
            }
        });
        
        let del = document.createElement("button");
        this.applyStyle(del, {
            fontSize: "0.75rem",
            width: "40px",
            height: "30px",
            border: "none",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            cursor: "pointer",
            backgroundColor: "#404040",
            color: "#fff"
        });
        del.textContent = "삭제";
        del.addEventListener("click", async (e) => {
            if(confirm("삭제 하시겠습니까?")) {
                let response = await fetch("/delDialogue", {
                    method: "POST",
                    body: JSON.stringify({callbackIdx: this.currentCategoryIdx, idx: i}),
                    headers: {"Content-Type":"application/json"}
                });
                let result = await response.json();
                alert(result.msg);
                if(result.cd == '0000') {
                    await this.setCategory();
                }
            }
        });


        let [td1, td2, td3, td4] = ['td','td','td','td'].map(tag => document.createElement(tag));

        this.applyStyle(td1, {
            padding: "0.5rem",
            textAlign: "center",
            border: "1px solid #ddd",
            width: "40px",
            backgroundColor: "#fff"
        });
        this.applyStyle(td2, {
            padding: "0.5rem",
            textAlign: "center",
            border: "1px solid #ddd",
            width: "auto",
            backgroundColor: "#fff"
        });
        this.applyStyle(td3, {
            textAlign: "center",
            border: "1px solid #ddd",
            width: "60px",
            padding: 0,
            backgroundColor: "#fff"
        });
        this.applyStyle(td4, {
            textAlign: "center",
            border: "1px solid #ddd",
            width: "60px",
            padding: 0,
            backgroundColor: "#fff"
        });

        td1.textContent = i + 1;
        td2.appendChild(qInput);
        td3.appendChild(mod);
        td4.appendChild(del);
        [td1, td2, td3, td4].map((v) => { tr.appendChild(v) });
        return tr;
    }

    setActive (categoryBtn) {
        let btns = document.querySelectorAll(".category");
        for(let i=0; i<btns.length; i++) {
            this.applyStyle(btns[i], {
                border: "none",
                outline: "none",
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                backgroundColor: "#fff",
                color: "#444",
                letterSpacing: "-1px",
                cursor: "pointer",
            });
        }
        this.applyStyle(categoryBtn, {
            border: "none",
            outline: "none",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            letterSpacing: "-1px",
            cursor: "pointer",
            color: "#fff",
            backgroundColor: "#444"
        })
    }


    setEvent() {
        this.dialogueAddBtn.addEventListener("click", async (e) => {
            let q = this.dialogueAddInput.value;
            if(!q || q.trim().length == 0) {
                alert("예상 질문을 입력해 주세요");
                return;
            } else {
                let response = await fetch("/addDialogue", {
                    method: "POST",
                    body: JSON.stringify({callbackIdx: this.currentCategoryIdx, q : q}),
                    headers: {"Content-Type":"application/json"}
                });
                let result = await response.json();
                alert(result.msg);
                if(result.cd == '0000') {
                    this.dialogueAddInput.value = "";
                    await this.setCategory();
                }
            }
        });

    }

    async elementInit() {
        [
            this.dialogueContainer, 
            this.dialogueTitle, 
            this.dialogueCateogryTitle,
            this.dialogueCategory,
            this.dialogueAddDiv,
            this.dialogueAddInput,
            this.dialogueAddBtn,
            this.dialogueContentHeader,
            this.dialogueContentHeaderBoard,
            this.dialogueContentHeaderBoardThead,
            this.dialogueContentHeaderBoardTr,
            this.dialogueContentHeaderBoardTh1,
            this.dialogueContentHeaderBoardTh2,
            this.dialogueContentHeaderBoardTh3,
            this.dialogueContentHeaderBoardTh4,
            this.dialogueContent,
            this.dialogueContentBoardDiv,
            this.dialogueContentBoard,
            this.dialogueContentBoardTbody,
            this.dialogueFooter
        ] = 
        [
            'div',
            'div',
            'div',
            'div',
            'div',
            'input',
            'button',
            'div',
            'table',
            'thead',
            'tr',
            'th',
            'th',
            'th',
            'th',
            'div',
            'div',
            'table',
            'tbody',
            'div'
        ].map(tag => document.createElement(tag));

        this.dialogueTitle.innerText = '질문 사전';
        this.dialogueCateogryTitle.innerText = '서비스 선택';
        this.dialogueAddInput.placeholder = '추가하시려는 예상 질문을 입력하세요';
        this.dialogueAddInput.spellcheck = false;
        this.dialogueAddBtn.innerText = '질문 추가';
        this.dialogueContentHeaderBoardTh1.innerText = 'No.';
        this.dialogueContentHeaderBoardTh2.innerText = '예상 질문';
        this.dialogueContentHeaderBoardTh3.innerText = '수정';
        this.dialogueContentHeaderBoardTh4.innerText = '삭제';
        this.dialogueFooter.innerText = '예상 질문이 많을 수록 사용자의 의도를 정확히 파악할 수 있습니다';

        this.dialogueAddDiv.appendChild(this.dialogueAddInput);
        this.dialogueAddDiv.appendChild(this.dialogueAddBtn);
        this.dialogueContentHeaderBoardTr.appendChild(this.dialogueContentHeaderBoardTh1);
        this.dialogueContentHeaderBoardTr.appendChild(this.dialogueContentHeaderBoardTh2);
        this.dialogueContentHeaderBoardTr.appendChild(this.dialogueContentHeaderBoardTh3);
        this.dialogueContentHeaderBoardTr.appendChild(this.dialogueContentHeaderBoardTh4);
        this.dialogueContentHeaderBoardThead.appendChild(this.dialogueContentHeaderBoardTr);
        this.dialogueContentHeaderBoard.appendChild(this.dialogueContentHeaderBoardThead);
        this.dialogueContentHeader.appendChild(this.dialogueContentHeaderBoard);
        this.dialogueContentBoard.appendChild(this.dialogueContentBoardTbody);
        this.dialogueContentBoard.classList.add("table");
        this.dialogueContentBoardDiv.appendChild(this.dialogueContentBoard);
        this.dialogueContentBoardDiv.classList.add("boardDiv");

        this.dialogueContent.appendChild(this.dialogueContentBoardDiv);
        this.dialogueContainer.appendChild(this.dialogueTitle);
        this.dialogueContainer.appendChild(this.dialogueCateogryTitle);
        this.dialogueContainer.appendChild(this.dialogueCategory);
        this.dialogueContainer.appendChild(this.dialogueAddDiv);
        this.dialogueContainer.appendChild(this.dialogueContentHeader);
        this.dialogueContainer.appendChild(this.dialogueContent);
        this.dialogueContainer.appendChild(this.dialogueFooter);

        this.elementStyle();
        this.setEvent();
        await this.setCategory();
    }

    elementStyle() {
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = 0;
        document.body.style.padding = 0;
        document.body.style.overflow = 'hidden';
        this.applyStyle(this.dialogueContainer, {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#f0f0f0",
        });
        this.applyStyle(this.dialogueTitle, {
            width: "100%",
            height: "60px",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            letterSpacing: "-1px",
            backgroundColor: "#404040",
            color: "#fff",
        });
        this.applyStyle(this.dialogueCateogryTitle,{
            width: "100%",
            padding: "1rem 1rem 0",
            backgroundColor: "#f0f0f0",
            height: "auto",
            color: "#404040",
            fontSize: "0.9rem",
            fontWeight: "bold",
            letterSpacing: "-1px",
        });
        this.applyStyle(this.dialogueCategory,{
            width: "100%",
            backgroundColor: "#f0f0f0",
            color: "#fff",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "start",
            alignItems: "center",
            padding: "0.5rem 1rem 1rem",
            gap: "0.5rem",
        });
        this.applyStyle(this.dialogueAddDiv,{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            padding: "0 1rem",
        });
        this.applyStyle(this.dialogueAddInput,{
            padding: "0 0.5rem",
            width: "calc(100% - 70px)",
            outline: "none",
            border: "1px solid #404040",
            borderRadius: "4px 0 0 4px",
        });
        this.applyStyle(this.dialogueAddBtn,{
            fontSize: "0.75rem",
            width: "70px",
            height: "30px",
            border: "none",
            whiteSpace: "nowrap",
            cursor: "pointer",
            backgroundColor: "#404040",
            color: "#fff",
            borderRadius:  "0 4px 4px 0",
        });
        this.applyStyle(this.dialogueContentHeader,{
            width: "100%",
            padding: "0 1rem",
        });
        this.applyStyle(this.dialogueContentHeaderBoard,{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.8rem",
        });
        this.applyStyle(this.dialogueContentHeaderBoardThead,{

        });
        this.applyStyle(this.dialogueContentHeaderBoardTr,{

        });
        this.applyStyle(this.dialogueContentHeaderBoardTh1,{
            padding: "0.5rem",
            textAlign: "center",
            border: "1px solid #ddd",
            width: "40px",
            backgroundColor: "#404040",
            color: "#fff",
        });
        this.applyStyle(this.dialogueContentHeaderBoardTh2,{
            padding: "0.5rem",
            textAlign: "center",
            border: "1px solid #ddd",
            width: "auto",
            backgroundColor: "#404040",
            color: "#fff",
        });
        this.applyStyle(this.dialogueContentHeaderBoardTh3,{
            textAlign: "center",
            border: "1px solid #ddd",
            width: "60px",
            padding: 0,
            backgroundColor: "#404040",
            color: "#fff",
        });
        this.applyStyle(this.dialogueContentHeaderBoardTh4,{
            textAlign: "center",
            border: "1px solid #ddd",
            width: "60px",
            padding: 0,
            backgroundColor: "#404040",
            color: "#fff",
        });
        this.applyStyle(this.dialogueContent,{
            width: "100%",
            flexGrow: 1,
            paddingLeft: "1rem",
            paddingRight: "0",
            overflow: "hidden",
        });
        this.applyStyle(this.dialogueContentBoardDiv,{
            width: "100%",
            height: "100%",
            overflowX: "hidden",
            overflowY: "scroll",
        });
        this.applyStyle(this.dialogueContentBoard,{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.8rem",
        });
        this.applyStyle(this.dialogueContentBoardTbody,{

        });
        this.applyStyle(this.dialogueFooter, {
            width: "100%",
            height: "70px",
            fontSize: "0.75rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#777",
            fontWeight: 600,
            letterSpacing: "-1px",
        });
    }

    applyStyle (el, styleObj) {
        el.style.boxSizing = "border-box";
        el.style.margin = 0;
        el.style.padding = 0;
        for (let [key, value] of Object.entries(styleObj)) {
            el.style[key] = value;
        }
    }
}