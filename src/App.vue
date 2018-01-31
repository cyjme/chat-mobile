<template>
  <div id="app">
    <div class="connection" :style="{'display':wsConStatus===true?'none':'block'}">连接中...</div>
    <router-view :contacts="contacts" :newMsg="newMsg" :sendMsg="sendMsg" :loadHistory="loadHistory" :wsConStatus="wsConStatus" :currentUser="currentUser"/>
    <lg-preview></lg-preview>
  </div>
</template>

<script>
import ReconnectWebsocket from "./ReconnectWebsocket";
import { scrollBottom } from "./help";
import config from "./config";

export default {
  name: "app",
  data() {
    return {
      jwtToken:null,
      wsConStatus: false,
      ws: null,
      contacts: [],
      currentUser: {
        userId: "",
        token: "",
        name: "",
        props: "",
        info: "",
        avatar: ""
      }
    };
  },
  methods: {
    fetchCurrentUser: async function() {
      await this.axios.get(`/currentUserInfo`).then(({ data }) => {
        this.currentUser = data;
        console.warn(data)
      });
    },
    newMsg: function(msg) {
      this.contacts.map((item, index) => {
        if (item.userId === msg.to) {
          this.contacts[index].msgs.push(msg);
        }
      });
    },
    newMsgFromServer: function(msg) {
      this.contacts.map((item, index) => {
        if (item.userId === msg.from) {
          this.contacts[index].msgs.push(msg);
        }
        if (item.userId === msg.to) {
          this.contacts[index].msgs.push(msg);
        }
      });
    },
    sendMsg: function(msg) {
      this.ws.send(JSON.stringify(msg));
    },
    listContacts: function() {
      this.axios.get(`/contacts`).then(({ data }) => {
        this.contacts = [];
        data.map(item => {
          item.msgs = [];
          this.contacts.push(item);
          this.loadHistory(this.currentUser.userId,item.userId);
        });
      });
    },
    loadHistory: function(userId, withUserId) {
      let sinceId = 999999999;
      this.contacts.map((item, index) => {
        if (item.userId === withUserId) {
          if (item.msgs[0] !== undefined) {
            sinceId = item.msgs[0].id;
          }
        }
      });
      let msg = {
        type: "imAction",
        actionType: "listHistory",
        userId: userId,
        withUserId: withUserId,
        sinceId: sinceId,
        num: 10
      };
      if (this.wsConStatus) {
        this.ws.send(JSON.stringify(msg));
      }
    }
  },
  created: async function() {
    // get jwtToken
    if(this.jwtToken == null){
      if(this.$route.query.jwtToken!=null){
        this.jwtToken = this.$route.query.jwtToken
        if(this.$route.query.contactUser != undefined){
          this.$router.push({
            name: "Chat",
            params: {
              toUser: this.$route.query.contactUser
            }
          });
        }
      }else{
        if(this.$route.query.contactUser != undefined){
          window.location = `${config.apiUrl}/login?contactUser=${this.$route.query.contactUser}`
          return
        }
        window.location = `${config.apiUrl}/login`
        return
      }
    }
    this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.jwtToken;

    //fetchCurrentUser
    // let userToken = this.$route.params.token;
    console.warn(this.jwtToken);
    await this.fetchCurrentUser();
    this.ws = new ReconnectWebsocket(config.wsUrl);
    // var ws = new WebSocket("ws://192.168.99.100:9503");
    this.ws.onopen = evt => {
      console.warn("userId in websocket",this.currentUser);
      var data = JSON.stringify({
        type: "login",
        token: this.currentUser.userId
      });
      this.ws.send(data);
      this.wsConStatus = true;
      this.listContacts();
    };

    this.ws.onmessage = evt => {
      let msg = JSON.parse(evt.data);

      if (msg.type == "im") {
        this.newMsgFromServer({
          msgId: msg.Id,
          type: "im",
          contentType: msg.contentType,
          content: msg.content,
          from: msg.from,
          to: msg.to,
          created_at: msg.created_at
        });
        scrollBottom();
      }
      if (msg.type == "imAction") {
        if (msg.data.length > 0) {
          let msgs = msg.data;
          let contactIndex;
          this.contacts.map((item, index) => {
            if (item.userId == msg.withUserId) {
              contactIndex = index;
            }
          });
          msgs.reverse();
          this.contacts[contactIndex].msgs.unshift(...msgs);
        }
      }
    };

    this.ws.onclose = evt => {
      this.wsConStatus = false;
      console.log("Connection closed.");
    };
  }
};
</script>

<style>
* {
  margin: 0px;
  padding: 0px;
}
body {
  background: #f0f1f2;
  font: 12px "Open Sans", sans-serif;
}
#view-code {
  color: #89a2b5;
  opacity: 0.7;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 700;
  text-decoration: none;
  position: absolute;
  top: 660px;
  left: 50%;
  margin-left: -50px;
  z-index: 200;
}
#view-code:hover {
  opacity: 1;
}
#chatbox {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  height: 100%;
  position: absolute;
}

#friendslist {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
#topmenu {
  height: 69px;
  width: 100%;
  border-bottom: 1px solid #d8dfe3;
  background: url("./assets/logo.png") no-repeat;
  background-position-x: 30px;
  background-position-y: center;
  background-size: contain;
}
#topmenu .left {
  float: left;
  height: 100%;
  width: 50%;
}
#topmenu .right {
  float: left;
  height: 100%;
  width: 50%;
  text-align: center;
  line-height: 69px;
  font-size: x-large;
}
.friend {
  height: 70px;
  border-bottom: 1px solid #e7ebee;
  position: relative;
}
.friend:hover {
  background: #f1f4f6;
  cursor: pointer;
}
.friend img {
  width: 40px;
  border-radius: 50%;
  margin: 15px;
  float: left;
}
.floatingImg {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  position: fixed;
  top: 32px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  border: 3px solid #fff;
}
.friend p {
  padding: 15px 0 0 0;
  float: left;
  width: 220px;
}
.friend p strong {
  font-weight: 600;
  font-size: 15px;
  color: #597a96;
}
.friend p span {
  font-size: 13px;
  font-weight: 400;
  color: #aab8c2;
}
.friend .status {
  background: #26c281;
  border-radius: 50%;
  width: 9px;
  height: 9px;
  position: absolute;
  top: 31px;
  right: 17px;
}
.friend .status.away {
  background: #ffce54;
}
.friend .status.inactive {
  background: #eaeef0;
}
#search {
  background: #e3e9ed;
    /*url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/search.png") -11px 0 no-repeat;*/
  height: 60px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
}
#searchfield {
  width: 100%;
  background: #e3e9ed;
  margin: 21px 0 0 55px;
  border: none;
  padding: 0;
  font-size: 14px;
  font-family: "Open Sans", sans-serif;
  font-weight: 400px;
  color: #8198ac;
}
#searchfield:focus {
  outline: 0;
}
#chatview {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
}
#profile {
  position: fixed;
  height: 50px;
  width: 100%;
  overflow: hidden;
  text-align: center;
  color: #fff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.p1 #profile {
  background: #f16a70;
    /*url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png") 0 0*/
    /*no-repeat;*/
  background-size: 100%;
}
#profile .avatar {
  width: 68px;
  border: 3px solid #fff;
  margin: 23px 0 0;
  border-radius: 50%;
}
#profile p {
  font-weight: 600;
  font-size: 15px;
  line-height: 15px;
  margin-top: 10px;
  opacity: 100;
  -webkit-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -moz-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -ms-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -o-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
}
#profile p.animate {
  margin-top: 97px;
  opacity: 1;
  -webkit-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -moz-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -ms-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -o-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
}
#profile span {
  font-weight: 400;
  font-size: 11px;
  line-height: 30px;
}
#chat-messages {
  background: white;
  position: fixed;
  top: 50px;
  bottom: 60px;
  opacity: 100;
  margin-top: 0;
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-right: 20px;
  -webkit-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -moz-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -ms-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  -o-transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
  transition: all 200ms cubic-bezier(0, 0.995, 0.99, 1);
}
#chat-messages.animate {
  opacity: 1;
  margin-top: 0;
}
#chat-messages label {
  color: #aab8c2;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
  margin: 15px 0;
  width: 100%;
  display: block;
}
#chat-messages div.message {
  padding: 0 0 30px 48px;
  clear: both;
  margin-bottom: 45px;
}
#chat-messages div.message.right {
  padding: 0 68px 30px 0;
  margin-right: -19px;
  margin-left: 19px;
}
#chat-messages .message img {
  float: left;
  margin-left: -38px;
  border-radius: 50%;
  width: 30px;
  margin-top: 12px;
}

#chat-messages div.message.right img {
  float: right;
  margin-left: 0;
  margin-right: -38px;
}

#chat-messages .message .text-avatar {
  float: left;
  margin-left: -38px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin: 12px 12px 0 -38px;
  font-size: 24px;
  background: #d81f06;
  text-align: center;
  line-height: 24px;
  color: #fff;
}

#chat-messages div.message.right .text-avatar{
    float: right;
    margin: 12px -38px 0 0;
}

.message .bubble {
  margin-bottom: 30px;
  background: #f0f4f7;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 13px;
  border-radius: 5px 5px 5px 0px;
  color: #8495a3;
  position: relative;
  float: left;
}
#chat-messages div.message.right .bubble {
  float: right;
  border-radius: 5px 5px 0px 5px;
}
.bubble .corner {
  background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/bubble-corner.png")
    0 0 no-repeat;
  position: absolute;
  width: 7px;
  height: 7px;
  left: -5px;
  bottom: 0;
}
div.message.right .corner {
  background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/bubble-cornerR.png")
    0 0 no-repeat;
  left: auto;
  right: -5px;
}
.bubble span {
  color: #aab8c2;
  font-size: 11px;
  position: absolute;
  right: 0;
  bottom: -22px;
}
#sendmessage {
  height: 60px;
  position: fixed;
  border-top: 1px solid #e7ebee;
  bottom: 0;
  right: 0px;
  width: 100%;
  background: #fff;
}
#sendmessage input {
  background: #fff;
  width: 88%;
  margin: 21px 0 0 21px;
  border: none;
  padding: 0;
  margin-left: 46px;
  font-size: 14px;
  font-family: "Open Sans", sans-serif;
  font-weight: 400;
  color: #aab8c2;
}
#sendmessage input:focus {
  outline: 0;
}
#sendmessage button {
  color: #aab8c2;
  font-size: 14px;
  font-weight: 400;
  background: #fff;
  /*background: #fff*/
    /*url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/send.png") 0 -41px no-repeat;*/
  width: 30px;
  height: 30px;
  position: absolute;
  right: 15px;
  top: 15px;
  border: none;
}
#sendmessage button:hover {
  cursor: pointer;
  background-position: 0 0;
}
#sendmessage button:focus {
  outline: 0;
}

#close {
  position: absolute;
  top: 8px;
  opacity: 0.8;
  right: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
#close:hover {
  opacity: 1;
}
.cx,
.cy {
  background: #fff;
  position: absolute;
  width: 0px;
  top: 15px;
  right: 15px;
  height: 3px;
  -webkit-transition: all 250ms ease-in-out;
  -moz-transition: all 250ms ease-in-out;
  -ms-transition: all 250ms ease-in-out;
  -o-transition: all 250ms ease-in-out;
  transition: all 250ms ease-in-out;
}
.cx.s1,
.cy.s1 {
  right: 0;
  width: 20px;
  -webkit-transition: all 100ms ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ms ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
.cy.s2 {
  -ms-transform: rotate(50deg);
  -webkit-transform: rotate(50deg);
  transform: rotate(50deg);
  -webkit-transition: all 100ms ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ms ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
.cy.s3 {
  -ms-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  -webkit-transition: all 100ms ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ms ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
.cx.s1 {
  right: 0;
  width: 20px;
  -webkit-transition: all 100ms ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ms ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
.cx.s2 {
  -ms-transform: rotate(140deg);
  -webkit-transform: rotate(140deg);
  transform: rotate(140deg);
  -webkit-transition: all 100ms ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
.cx.s3 {
  -ms-transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
  transform: rotate(135deg);
  -webkit-transition: all 100ease-out;
  -moz-transition: all 100ms ease-out;
  -ms-transition: all 100ms ease-out;
  -o-transition: all 100ms ease-out;
  transition: all 100ms ease-out;
}
#chatview,
#sendmessage {
  overflow: hidden;
  border-radius: 6px;
}
.connection {
  position: fixed;
  width: 100%;
  height: 30px;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 100;
  background: rgba(255, 197, 66, 0.62);
  text-align: center;
}

#sendmessage img {
  height: 28px;
  position: absolute;
  margin: auto;
  top: 0;
  left: 6px;
  bottom: 0;
}

.img-msg {
  float: none !important;
  width: 200px !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

#friends {
  overflow-y: scroll;
  height: 100%;
}
.text-avatar {
  width: 40px;
  border-radius: 50%;
  margin: 15px;
  float: left;
  font-size: 24px;
  display: block;
  background: #d81f06;
  height: 40px;
  text-align: center;
  line-height: 40px;
  color: #fff;
}

.text-avatar-chat {
  float: left;
  font-size: 24px;
  background: #d81f06;
  text-align: center;
  line-height: 68px;
  color: #fff;
}

@media (min-width: 700px) {
  #chatbox {
    width: 1000px;
    height: 600px;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  #chatview {
    position: absolute;
    width: 1000px;
    height: 600px;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  #profile {
    position: absolute;
  }
  #chat-messages {
    position: absolute;
  }
  #sendmessage {
    position: absolute;
  }

  .floatingImg {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    border: 3px solid #fff;
  }
  #friends {
    overflow-y: scroll;
    height: 470px;
  }
}
</style>
