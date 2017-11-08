<template>
<div>
    <div id="chatview" class="p1">    	
        <div id="profile">
            <div id="close" @click="goToContacts">
                <div class="cy s1 s2 s3"></div>
                <div class="cx s1 s2 s3"></div>
            </div>
            <p>{{profile==null?"":profile.name}}</p>
            <span>{{profile==null?"":profile.info}}</span>
        </div>
        <div id="chat-messages" v-on:scroll="handleScroll">
        	<label>已经到顶端了</label>
            <div  v-for="msg in msgList" :class="msg.to==to?'message right':'message'" :key="msg.msgId">
            	<img :src="msg.to == to?fromUser.avatar:toUser.avatar" />
                <div class="bubble">
                  {{msg.content}}
                    <div class="corner"></div>
                    <span>{{new Date(msg.created_at).getHours()+":"+(new Date(msg.created_at).getMinutes()<10 ? "0"+new Date(msg.created_at).getMinutes(): new Date(msg.created_at).getMinutes())}}</span>
                </div>
            </div>
        </div>

        <div id="sendmessage">
        	<input type="text" v-model="inputText" placeholder="please Input" v-on:keyup.enter="handleClickSend"/>
            <button id="send" @click="handleClickSend"></button>
        </div>
    
    </div>        
    <img :src="profile==null?'':profile.avatar" class="floatingImg">

</div>
</template>

<script>
import {scrollBottom} from "../../help";
export default {
  name: "chat",
  props: ["contacts", "newMsg", "sendMsg", "loadHistory"],
  data() {
    return {
      from: this.$route.params.token,
      to: this.$route.params.toToken,
      fromUser: {},
      toUser: {},
      inputText: ""
    };
  },
  methods: {
    handleScroll: function() {
      let chatMessages = document.getElementById("chat-messages");
      if ((chatMessages.scrollTop == 0)) {
        this.loadHistory(this.from, this.to);
      }
    },
    goToContacts: function() {
      this.$router.push({
        name: "ContactList",
        params: {
          accToken: this.from
        }
      });
    },
    handleClickSend: function() {
      this.newMsg({
        msgId: Math.random(),
        type: "im",
        contentType: "text",
        content: this.inputText,
        from: this.from,
        to: this.to,
        created_at: new Date()
      });
      this.sendMsg({
        type: "im",
        contentType: "text",
        content: this.inputText,
        from: this.from,
        to: this.to
      });
      this.inputText = "";
    }
  },
  created: function() {
    this.axios
      .post(`/acc/${this.from}/contacts`, { contactAccToken: this.to })
      .then(data => {
        console.warn("create contact", data);
      });

    this.contacts.map(item => {
      if (item.token == this.from) {
        this.fromUser = item;
      }
      if (item.token == this.to) {
        this.toUser = item;
      }
    });
  },
  mounted: function() {
    console.warn("mounted");
    // let chatMessages = document.getElementById("chat-messages");
    // console.warn("dom", chatMessages);
    // chatMessages.addEventListener(
    //   "scroll",
    //   this.loadHistory(this.from, this.to)
    // );
  },
  computed: {
    msgList: function msgList() {
      let msgs = [];
      this.contacts.map(item => {
        if (item.token === this.to) {
          msgs = item.msgs;
        }
      });
      scrollBottom();
      return msgs;
    },
    profile: function profile() {
      let contact;
      this.contacts.map((item, index) => {
        if (item.token === this.to) {
          contact = item;
        }
      });

      return contact;
    }
  }
};
</script>
<style>

</style>
