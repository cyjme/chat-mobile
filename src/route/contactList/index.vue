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
    let userToken = this.$route.params.token;
    // this.axios.get("/test").then(() => {});
  },
  methods: {
    handleClick(token) {
      let userToken = this.$route.params.token;
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
