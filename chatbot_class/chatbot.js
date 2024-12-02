class Chatbot {
    constructor(target, option = {}) {
        this.target = target;
        this.backgroundColor = option.backgroundColor ? option.backgroundColor : '#4b4b4b';
        this.lightBg = this.adjustBrightness(this.backgroundColor, 2.5);
        this.userFontColor = option.userFontColor ? option.userFontColor : "#fff";
        this.botFontColor = option.botFontColor ? option.botFontColor : "#4b4b4b";
        this.title = option.title ? option.title : "챗봇";
        this.width = option.width ? option.width : "450px";
        this.height = option.height ? option.height : "600px";
        this.placeholder = option.placeholder ? option.placeholder : "메시지 입력";
        this.sendIcon = option.sendIcon ? option.sendIcon : "▲";
        this.loadingIcon = option.loadingIcon ? option.loadingIcon : "■";
        this.loadingMsg = option.loadingMsg ? option.loadingMsg : "답변을 준비중입니다";
        this.loadingInteravl;

        this.commonEndpoint = window.endpoint;
        this.chatbotEndpoint = this.commonEndpoint + "/chatbot";
        this.configEndpoint = this.commonEndpoint + "/getConfig";
        
        this.init();
    }
    async setConfig() {
        let response = await fetch(this.configEndpoint);
        let resObj = await response.json();
        let result = resObj.config;
        this.config = result;
        return resObj;
    }
    async init () {

        let test = await this.setConfig();
        console.log("test : ", test);
        [
            this.chatbotContainer, 
            this.chatbotTitle, 
            this.chatbotMsg,
            this.chatbotInput,
            this.userInput,
            this.userInputSubmit,
            this.chatbotInputSubmitBtn,
            this.alertMsg,
            this.alertMsgTail
        ] = 
        [
            'div',
            'div',
            'div',
            'div',
            'textarea',
            'div',
            'button',
            'div',
            'div'
        ].map(tag => document.createElement(tag));

        this.chatbotContainer.appendChild(this.chatbotTitle);
        this.chatbotContainer.appendChild(this.chatbotMsg);
        this.chatbotContainer.appendChild(this.chatbotInput);
        this.chatbotContainer.appendChild(this.alertMsg);
        this.chatbotContainer.appendChild(this.alertMsgTail);
        this.chatbotInput.appendChild(this.userInput);
        this.chatbotInput.appendChild(this.userInputSubmit);
        this.userInputSubmit.appendChild(this.chatbotInputSubmitBtn);

        this.chatbotTitle.innerHTML = this.title;
        this.userInput.placeholder = this.placeholder;
        this.userInput.setAttribute("spellCheck", "false");
        this.chatbotInputSubmitBtn.textContent = this.sendIcon;
        this.styling();
        this.setEvent();

        let targetElement = document.querySelector(this.target);
        if(!targetElement) {
            throw new Error("target이 존재하지 않습니다.");
        }
        targetElement.replaceWith(this.chatbotContainer);
    }

    styling () {
        let styleObj = {
            width : this.width,
            height : this.height,
            border : "1px solid " + this.backgroundColor,
            display : "flex",
            justifyContent : "center",
            alignItems : "center",
            flexDirection : "column",
            overflow : "hidden",
            borderRadius : "5px",
            position: "relative"
        }
        this.applyStyle(this.chatbotContainer, styleObj);

        styleObj = {
            width : "100%",
            height : "50px",
            minHeight : "50px",
            backgroundColor : this.backgroundColor,
            color : this.userFontColor,
            display : "flex",
            alignItems : "center",
            paddingLeft : "1rem"
        }
        this.applyStyle(this.chatbotTitle, styleObj);

        styleObj = {
            width: "100%",
            flexGrow: 1,
            overflowX: "hidden",
            overflowY: "auto",
            paddingBottom: "1rem",
            position: "relative",
            backgroundColor: "#fff"
        }
        this.applyStyle(this.chatbotMsg, styleObj);

        styleObj = {
            width: "100%",
            height: "100px",
            minHeight: "100px",
            borderTop: "1px solid " + this.backgroundColor,
            backgroundColor: this.lightBg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            overflow: "hidden",
            position: "relative"
        }
        this.applyStyle(this.chatbotInput, styleObj);

        styleObj = {
            resize: "none",
            flexGrow: 1,
            height: "100%",
            border: "none",
            outline: "none",
            borderRadius: "4px 0 0 4px",
            border: "1px solid " + this.backgroundColor,
            borderRight: "none",
            padding: "0.5rem"
            
        }
        this.applyStyle(this.userInput, styleObj);

        styleObj = {
            width: "50px",
            height: "100%",
            borderRadius: "0 4px 4px 0",
            border: "1px solid " + this.backgroundColor,
            borderLeft: "none",
            backgroundColor: "#fff",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }
        this.applyStyle(this.userInputSubmit, styleObj);

        styleObj = {
            display: "inline-block",
            width: "30px",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            border: "none",
            outline: "none",
            backgroundColor: this.backgroundColor,
            color: this.userFontColor,
            fontSize: "0.7rem",
            overflow: "hidden",
            cursor: "pointer",
            padding: 0
        }
        this.applyStyle(this.chatbotInputSubmitBtn, styleObj);

        styleObj = {
            display: "none",
            height: "30px",
            padding: "0 1rem",
            borderRadius: "4px",
            backgroundColor: this.backgroundColor,
            color: this.userFontColor,
            fontSize: "0.8rem",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            bottom: "calc(90px - (30px / 2))",
            right: "1rem",
            zIndex: "999",
            opacity: 0,
            transition: "0.4s ease-in-out"
        }
        this.applyStyle(this.alertMsg, styleObj);
        styleObj = {
            display: "none",
            position: "absolute",
            bottom: "calc(90px - (30px / 2) - 10px)",
            right: "calc(1rem + 1rem)",
            zIndex: "999",
            opacity: 0,
            transition: "0.4s ease-in-out",
            borderTop: "10px solid " + this.backgroundColor,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "0px solid transparent",

        }
        this.applyStyle(this.alertMsgTail, styleObj);

    }

    applyStyle (el, styleObj) {
        for (let [key, value] of Object.entries(styleObj)) {
            el.style[key] = value;
        }
        el.style.boxSizing = "border-box";
    }

    alertMessage(msg) {
        this.alertMsg.innerHTML = msg;
        this.alertMsg.style.display = "flex";
        this.alertMsg.style.opacity = 0;
        this.alertMsgTail.style.display = "flex";
        this.alertMsgTail.style.opacity = 0;
        setTimeout(()=>{
            this.alertMsg.style.opacity = 1;
            this.alertMsgTail.style.opacity = 1;
            setTimeout(()=>{
                this.alertMsg.style.opacity = 0;
                this.alertMsgTail.style.opacity = 0;
                setTimeout(()=>{
                    this.alertMsg.style.display = "none";
                    this.alertMsgTail.style.display = "none";
                }, 200);
            }, 1800);
        }, 10);
    }

    async sendMsg () {

        if(this.chatbotInputSubmitBtn.disabled) {
            this.alertMessage("현재 답변을 생성중입니다.");
            return;
        }
        let text = this.userInput.value;
        if(!text || text.trim().length == 0) {
            this.alertMessage("메시지를 입력해주세요.");
            this.userInput.focus();
            return;
        }
        if(text.length > this.config.onceLimit) {
            this.alertMessage(`메시지를 ${this.config.onceLimit}글자 이하로 입력해주세요`);
            this.userInput.focus();
            return;
        }
        this.chatbotInputSubmitBtn.disabled = true;
        this.chatbotInputSubmitBtn.textContent = "■";
        this.userInput.value = "";
        let sendMsg = document.createElement("div");
        let sendMsgDiv = document.createElement("div");
        this.applyStyle(sendMsg, {
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: "1rem 1rem 0",
            justifyContent: "end"
        });
        this.applyStyle(sendMsgDiv, {
            padding: "0.5rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            border: "1px solid " + this.backgroundColor,
            backgroundColor: this.backgroundColor,
            color: this.userFontColor,
            whiteSpace: "pre-wrap",
            maxWidth: "75%"
        });


        this.styling('user');
        sendMsgDiv.textContent = text;
        sendMsg.appendChild(sendMsgDiv);
        this.chatbotMsg.appendChild(sendMsg);
        
        let botMsg = document.createElement("div");
        let botImg = document.createElement("div");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 -960 960 960");
        svg.setAttribute("fill", this.userFontColor);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M160-120v-200q0-33 23.5-56.5T240-400h480q33 0 56.5 23.5T800-320v200H160Zm200-320q-83 0-141.5-58.5T160-640q0-83 58.5-141.5T360-840h240q83 0 141.5 58.5T800-640q0 83-58.5 141.5T600-440H360ZM240-200h480v-120H240v120Zm120-320h240q50 0 85-35t35-85q0-50-35-85t-85-35H360q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0-80q17 0 28.5-11.5T400-640q0-17-11.5-28.5T360-680q-17 0-28.5 11.5T320-640q0 17 11.5 28.5T360-600Zm240 0q17 0 28.5-11.5T640-640q0-17-11.5-28.5T600-680q-17 0-28.5 11.5T560-640q0 17 11.5 28.5T600-600ZM480-200Zm0-440Z");
        svg.appendChild(path);
        let botMsgDiv = document.createElement("div");
        this.applyStyle(botMsg, {
            width: "100%",
            padding: "1rem 1rem 0",
            display: "flex",
            justifyContent: "end",
            alignItems: "start",
            gap: "0.5rem",
            position: "relative",
        });
        this.applyStyle(botImg, {
            width: "30px",
            aspectRatio: "1 / 1",
            backgroundColor: this.backgroundColor,
            borderRadius: "50%",
            overflow: "hidden",
            position: "absolute",
            top: "1rem",
            left: "1rem",
            border: "3px solid #fff",
            boxShadow: "0px 0px 0px 1px " + this.lightBg
        });
        this.applyStyle(botMsgDiv, {
            backgroundColor: "#fff",
            padding: "1.5rem 1rem 1rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            width: "calc(100% - 10px)",
            border: "1px solid " + this.lightBg,
            whiteSpace: "pre-wrap",
            marginTop: "10px"
        });


        this.styling('bot');
        botImg.appendChild(svg);
        botMsg.appendChild(botImg);
        botMsg.appendChild(botMsgDiv);
        this.chatbotMsg.appendChild(botMsg);
        this.userInput.focus();
        
        let loadingMsg = this.loadingMsg
        botMsgDiv.textContent = loadingMsg;
        this.loadingInteravl = setInterval(()=>{
            if(botMsgDiv.textContent == loadingMsg + '...') {
                botMsgDiv.textContent = loadingMsg;
            } else {
                botMsgDiv.textContent += '.';
            }
        }, 500);
        this.chatbotMsg.scrollTop = this.chatbotMsg.scrollHeight;
        
        //봇응답 받아오기
        let botResponse = await fetch(this.chatbotEndpoint, {
            method: "POST",
            body: JSON.stringify({userInput : text}),
            headers: {"Content-Type":"application/json"}
        });
        let resJson = await botResponse.json();
        let result = resJson.reply;
        
        setTimeout(() => {
            clearInterval(this.loadingInteravl);
            botMsgDiv.textContent = result;
            this.chatbotInputSubmitBtn.disabled = false;
            this.chatbotInputSubmitBtn.textContent = "▲";
            this.chatbotMsg.scrollTop = this.chatbotMsg.scrollHeight;
        }, 500);
    }

    setEvent () {
        this.userInput.addEventListener("keydown", async (e) => {
            if(e.shiftKey && e.key.toLowerCase() == 'enter') {
                return;
            }
            switch(e.key.toLowerCase()) {
                case 'enter' : 
                    e.preventDefault();
                    await this.sendMsg();
                break;
            }
        });

        this.chatbotInputSubmitBtn.addEventListener("click", async (e) => {
            await this.sendMsg();
        });
    }

    adjustBrightness(color, brightnessFactor) {
        const parseColor = (color) => {
            let rgba = { r: 0, g: 0, b: 0, a: 1 };
            
            if (color.startsWith("#")) {
                const hex = color.slice(1);
                const hexLen = hex.length;
    
                if (hexLen === 3 || hexLen === 4) {
                    // 3글자 혹은 4글자 HEX
                    rgba.r = parseInt(hex[0] + hex[0], 16);
                    rgba.g = parseInt(hex[1] + hex[1], 16);
                    rgba.b = parseInt(hex[2] + hex[2], 16);
                    if (hexLen === 4) {
                        rgba.a = parseInt(hex[3] + hex[3], 16) / 255;
                    }
                } else if (hexLen === 6 || hexLen === 8) {
                    // 6글자 혹은 8글자 HEX
                    rgba.r = parseInt(hex.slice(0, 2), 16);
                    rgba.g = parseInt(hex.slice(2, 4), 16);
                    rgba.b = parseInt(hex.slice(4, 6), 16);
                    if (hexLen === 8) {
                        rgba.a = parseInt(hex.slice(6, 8), 16) / 255;
                    }
                }
            } else if (color.startsWith("rgb")) {
                const match = color.match(/rgba?\(([^)]+)\)/);
                if (match) {
                    const parts = match[1].split(",").map((v) => parseFloat(v.trim()));
                    rgba.r = parts[0];
                    rgba.g = parts[1];
                    rgba.b = parts[2];
                    if (parts.length === 4) {
                        rgba.a = parts[3];
                    }
                }
            }
    
            return rgba;
        };
    
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    
        const adjustColor = (rgba, factor) => {
            return {
                r: clamp(Math.round(rgba.r * factor), 0, 255),
                g: clamp(Math.round(rgba.g * factor), 0, 255),
                b: clamp(Math.round(rgba.b * factor), 0, 255),
                a: rgba.a,
            };
        };
    
        const toRgbaString = (rgba) => {
            return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        };
    
        const rgba = parseColor(color);
        const adjusted = adjustColor(rgba, brightnessFactor);
        return toRgbaString(adjusted);
    }
}