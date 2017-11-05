<template>
<div>
    <div id="chatview" class="p1">    	
        <div id="profile">

            <div id="close" @click="goToContacts">
                <div class="cy s1 s2 s3"></div>
                <div class="cx s1 s2 s3"></div>
            </div>
            <p>Miro Badev</p>
            <span>miro@badev@gmail.com</span>
        </div>
        <div id="chat-messages">
        	<label>Thursday 02</label>
            <div  v-for="msg in msgList" class="message" :key="msg.msgId">
            	<img :src="fromUser.avatar" />
                <div class="bubble">
                  {{msg.content}}
                    <div class="corner"></div>
                    <span>3 min</span>
                </div>
            </div>

            <div class="message">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <div class="bubble">
                	Really cool stuff!
                    <div class="corner"></div>
                    <span>3 min</span>
                </div>
            </div>
            
            <div class="message right">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg" />
                <div class="bubble">
                	Can you share a link for the tutorial?
                    <div class="corner"></div>
                    <span>1 min</span>
                </div>
            </div>
            
            <div class="message">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <div class="bubble">
                	Yeah, hold on
                    <div class="corner"></div>
                    <span>Now</span>
                </div>
            </div>
            
            <div class="message right">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg" />
                <div class="bubble">
                	Can you share a link for the tutorial?
                    <div class="corner"></div>
                    <span>1 min</span>
                </div>
            </div>
            
            <div class="message">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <div class="bubble">
                	Yeah, hold on
                    <div class="corner"></div>
                    <span>Now</span>
                </div>
            </div>
            
        </div>
    	
        <div id="sendmessage">
        	<input type="text" v-model="inputText" placeholder="please Input" />
            <button id="send" @click="sendMsg"></button>
        </div>
    
    </div>        
    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" class="floatingImg">

</div>
</template>

<script>
export default {
  name: "chat",
  props: ["contacts","newMsg"],
  methods:{
    goToContacts: function(){
      this.$router.push({
        name: "ContactList",
        params: {
          accToken: this.from,
        }
      });
    },
    sendMsg:function(){
      this.newMsg({
        msgId:new Date(),
        type:"im",
        contentType:"text",
        content:this.inputText,
        from:this.from,
        to:this.to
      })
      this.inputText = ""
    }
  },
  data() {
    return {
      from: this.$route.params.token,
      to: this.$route.params.toToken,
      fromUser:{},
      toUser:{},
      inputText:"",
    };
  },
  created: function() {
    console.warn("start chat");
    console.warn("token", this.$route.params.token);
    console.warn("toToken", this.$route.params.toToken);
    console.warn("cccc",this.contacts)
    this.contacts.map(item=>{
      if(item.token==this.from){
        console.warn("iiii",item)
        this.fromUser = item
        console.warn("iiii2",this.fromUser)
      }
      if(item.token==this.to){
        this.toUser = item
      }
    })
    this.axios.get("/test").then(() => {});
  },
  computed: {
    msgList: function msgList() {
      let msgs = [];
      this.contacts.map(item => {
        if (item.token === this.to) {
          msgs = item.msgs;
        }
      });
      return msgs;
    },
  }
};
</script>

<style>

</style>
