<template>
<div id="chatbox">
	<div id="friendslist">
    	<div id="topmenu">
        	<span class="friends"></span>
            <span class="chats"></span>
            <span class="history"></span>
        </div>
        
        <div id="friends">

        	<div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.token)">
            	<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <p>
                	<strong>{{contact.name}}</strong>
                    <br />
	                <span>{{contact.info}}</span>
                </p>
                <div class="status available"></div>
            </div>

            <div id="search">
	            <input type="text" id="searchfield" placeholder="Search contacts..." />
            </div>
        </div>                
    </div>	
</div>	

</template>

<script>
export default {
  name: "contactList",
  props: ["contacts", "newMsg"],
  created: function() {
    let userToken = this.$route.params.accToken;
    // this.axios.get("/test").then(() => {});
    // var ws = new WebSocket("ws://127.0.0.1:9009");
    var ws = new WebSocket("ws://192.168.99.100:9503");
    ws.onopen = function(evt) {
      console.log("Connection open ...");
      var data = JSON.stringify({
        type: "login",
        token: userToken
      });
      ws.send(data);
    };

    let newMsg = this.newMsg
    ws.onmessage = function(evt) {
      let msg = JSON.parse(evt.data);
      console.warn("msgggg", msg);

      newMsg({
        msgId: new Date(),
        type: "im",
        contentType: "text",
        content: msg.content,
        from: msg.fromAccToken,
        to: msg.toAccToken
      });
    };

    ws.onclose = function(evt) {
      console.log("Connection closed.");
    };
  },
  methods: {
    handleClick(token) {
      let userToken = this.$route.params.accToken;
      console.warn("toknnnn", token);
      this.$router.push({
        name: "Chat",
        params: {
          token: userToken,
          toToken: token
        }
      });
    }
  }
};
</script>

<style>

</style>
